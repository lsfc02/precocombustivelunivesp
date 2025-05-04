
from app import db, Posto

# Apagar e recriar banco
db.drop_all()
db.create_all()

# Popular alguns postos
postos = [
    Posto(nome='Posto A', endereco='Rua 1, Centro', latitude=-23.5505, longitude=-46.6333,
          preco_gasolina=5.29, preco_etanol=3.59, preco_diesel=4.89),
    Posto(nome='Posto B', endereco='Av. Paulista', latitude=-23.5617, longitude=-46.6559,
          preco_gasolina=5.19, preco_etanol=3.69, preco_diesel=4.79),
    Posto(nome='Posto C', endereco='Rua Augusta', latitude=-23.5560, longitude=-46.6619,
          preco_gasolina=5.49, preco_etanol=3.39, preco_diesel=4.99)
]

db.session.add_all(postos)
db.session.commit()

print('Banco resetado e populado com sucesso!')
