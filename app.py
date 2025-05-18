from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from math import radians, sin, cos, sqrt, atan2
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = 'segredo_super_secreto'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fuel.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

PESO_DISTANCIA = 0.05

class Admin(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Posto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    endereco = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    preco_gasolina = db.Column(db.Float, nullable=True)
    preco_etanol = db.Column(db.Float, nullable=True)
    preco_diesel = db.Column(db.Float, nullable=True)
    imagem = db.Column(db.String(200), nullable=True)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'endereco': self.endereco,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'preco_gasolina': self.preco_gasolina,
            'preco_etanol': self.preco_etanol,
            'preco_diesel': self.preco_diesel,
            'imagem': self.imagem,
            'atualizado_em': self.atualizado_em.isoformat() if self.atualizado_em else None
        }

@login_manager.user_loader
def load_user(user_id):
    return Admin.query.get(int(user_id))

with app.app_context():
    db.create_all()
    if not Admin.query.filter_by(username='admin').first():
        admin = Admin(username='admin', password=generate_password_hash('admin123'))
        db.session.add(admin)
        db.session.commit()

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

@app.route('/')
def index():
    tipo = request.args.get('tipo', 'gasolina')
    if tipo not in ['gasolina', 'etanol', 'diesel']:
        tipo = 'gasolina'

    if tipo == 'gasolina':
        postos = Posto.query.order_by(Posto.preco_gasolina.asc()).limit(10).all()
    elif tipo == 'etanol':
        postos = Posto.query.order_by(Posto.preco_etanol.asc()).limit(10).all()
    else:
        postos = Posto.query.order_by(Posto.preco_diesel.asc()).limit(10).all()

    return render_template('index.html', postos=postos, tipo=tipo)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = Admin.query.filter_by(username=username).first()  # <- faltava isso aqui

        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('admin'))
        else:
            flash('Usuário ou senha incorretos')
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin():
    postos = Posto.query.all()
    return render_template('admin.html', postos=postos)

@app.route('/admin/delete/<int:id>')
@login_required
def delete_posto(id):
    posto = Posto.query.get_or_404(id)
    if posto.imagem:
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], posto.imagem))
        except FileNotFoundError:
            pass
    db.session.delete(posto)
    db.session.commit()
    return redirect(url_for('admin'))

@app.route('/admin/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_posto(id):
    posto = Posto.query.get_or_404(id)
    if request.method == 'POST':
        posto.nome = request.form['nome']
        posto.endereco = request.form['endereco']
        posto.latitude = float(request.form['latitude'])
        posto.longitude = float(request.form['longitude'])
        posto.preco_gasolina = float(request.form.get('preco_gasolina') or 0)
        posto.preco_etanol = float(request.form.get('preco_etanol') or 0)
        posto.preco_diesel = float(request.form.get('preco_diesel') or 0)
        db.session.commit()
        return redirect(url_for('admin'))
    return render_template('admin_edit.html', posto=posto)

@app.route('/cadastro', methods=['GET', 'POST'])
@login_required
def cadastro():
    if request.method == 'POST':
        imagem_file = request.files.get('imagem')
        filename = None
        if imagem_file and imagem_file.filename:
            filename = secure_filename(imagem_file.filename)
            imagem_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        posto = Posto(
            nome=request.form['nome'],
            endereco=request.form['endereco'],
            latitude=float(request.form['latitude']),
            longitude=float(request.form['longitude']),
            preco_gasolina=float(request.form.get('preco_gasolina') or 0),
            preco_etanol=float(request.form.get('preco_etanol') or 0),
            preco_diesel=float(request.form.get('preco_diesel') or 0),
            imagem=filename
        )
        db.session.add(posto)
        db.session.commit()
        return redirect(url_for('admin'))
    return render_template('cadastro.html')

@app.route('/api/sugerir')
def api_sugerir():
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        tipo = request.args.get('tipo', 'gasolina')
        if tipo not in ['gasolina', 'etanol', 'diesel']:
            tipo = 'gasolina'

        postos = Posto.query.all()
        melhor_posto = None
        melhor_pontuacao = float('inf')

        for posto in postos:
            if tipo == 'gasolina' and posto.preco_gasolina:
                preco = posto.preco_gasolina
            elif tipo == 'etanol' and posto.preco_etanol:
                preco = posto.preco_etanol
            elif tipo == 'diesel' and posto.preco_diesel:
                preco = posto.preco_diesel
            else:
                continue

            distancia = haversine(lat, lon, posto.latitude, posto.longitude)
            pontuacao = preco + (distancia * PESO_DISTANCIA)

            if pontuacao < melhor_pontuacao:
                melhor_pontuacao = pontuacao
                melhor_posto = posto

        if melhor_posto:
            return jsonify(melhor_posto.to_dict())
        else:
            return jsonify({'error': 'Nenhum posto encontrado para este tipo de combustível'}), 404

    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500



CORS(app,  supports_credentials=True)

@app.route('/api/top10')
def api_top10():
    tipo = request.args.get('tipo', 'gasolina')
    if tipo not in ['gasolina', 'etanol', 'diesel']:
        tipo = 'gasolina'

    if tipo == 'gasolina':
        postos = Posto.query.order_by(Posto.preco_gasolina.asc()).limit(10).all()
    elif tipo == 'etanol':
        postos = Posto.query.order_by(Posto.preco_etanol.asc()).limit(10).all()
    else:
        postos = Posto.query.order_by(Posto.preco_diesel.asc()).limit(10).all()

    return jsonify([p.to_dict() for p in postos])

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('usuario')
    password = data.get('senha')

    user = Admin.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        login_user(user)  # <- Isso permite acessar rotas protegidas como /admin
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401

# ================================
# APIs para integração com o front
# ================================

@app.route('/api/postos', methods=['GET'])
def api_get_postos():
    postos = Posto.query.all()
    return jsonify([p.to_dict() for p in postos])

@app.route('/api/postos/<int:id>', methods=['DELETE'])
def api_delete_posto(id):
    posto = Posto.query.get_or_404(id)
    if posto.imagem:
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], posto.imagem))
        except FileNotFoundError:
            pass
    db.session.delete(posto)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/postos/<int:id>', methods=['PUT'])
def api_edit_posto(id):
    posto = Posto.query.get_or_404(id)
    data = request.get_json()
    # Só atualiza se foi enviado no JSON, senão mantém o valor antigo
    posto.nome = data.get('nome', posto.nome)
    posto.endereco = data.get('endereco', posto.endereco)
    posto.latitude = float(data.get('latitude', posto.latitude))
    posto.longitude = float(data.get('longitude', posto.longitude))
    posto.preco_gasolina = float(data.get('preco_gasolina', posto.preco_gasolina))
    posto.preco_etanol = float(data.get('preco_etanol', posto.preco_etanol))
    posto.preco_diesel = float(data.get('preco_diesel', posto.preco_diesel))
    db.session.commit()
    return jsonify({'success': True, 'posto': posto.to_dict()})

@app.route('/api/postos', methods=['POST'])
@login_required
def api_criar_posto():
    if request.content_type.startswith('multipart/form-data'):
        # Se vier formulário com arquivo (imagem)
        imagem_file = request.files.get('imagem')
        filename = None
        if imagem_file and imagem_file.filename:
            filename = secure_filename(imagem_file.filename)
            imagem_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        data = request.form
    else:
        # Se vier puro JSON (sem imagem)
        data = request.get_json()
        filename = data.get('imagem')  # ou None

    posto = Posto(
        nome=data.get('nome'),
        endereco=data.get('endereco'),
        latitude=float(data.get('latitude') or 0),
        longitude=float(data.get('longitude') or 0),
        preco_gasolina=float(data.get('preco_gasolina') or 0),
        preco_etanol=float(data.get('preco_etanol') or 0),
        preco_diesel=float(data.get('preco_diesel') or 0),
        imagem=filename
    )
    db.session.add(posto)
    db.session.commit()
    return jsonify({'success': True, 'posto': posto.to_dict()})



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

    
