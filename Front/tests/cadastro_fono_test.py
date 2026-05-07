# Importa o webdriver para conrolar o navegador
from selenium import webdriver

# Gerencia serviço do ChromeDriver.
from selenium.webdriver.chrome.service import Service

# Baixa automaticamente o ChromeDriver correto.
from webdriver_manager.chrome import ChromeDriverManager

# Permite configurar opções do Chrome.
from selenium.webdriver.chrome.options import Options
import time
from pages.cadastro_page import CadastroPage


# Função que usa o CadastroPage pra abrir o navegador, acessar o sistema e executar o fluxo de teste.
def test_cadastro_fono():

    # Cria objeto de configurações do Chrome.
    options = Options()
    # Faz o navegador permanecer aberto após o teste terminar.
    options.add_experimental_option("detach", True)

    # baixa automaticamente o ChromeDriver correto e configura o caminho.
    service = Service(ChromeDriverManager().install())
    # Abre navegador Chrome.
    driver = webdriver.Chrome(service=service, options=options)

    # abre a URL
    driver.get("http://localhost:5173/cadastro-fono")
    # Maximiza a página
    driver.maximize_window()

    # Cria um objeto da classe CadastroPage
    page = CadastroPage(driver)

    time.sleep(2)

    # chama as funções da classe CadastroPage
    page.preencher_nome("Fono Teste")
    page.preencher_cpf("12345678999")
    page.preencher_crfa("123-PA")
    page.preencher_telefone("00999999999")
    page.preencher_email("fono01@email.com")

    time.sleep(2)
    page.clicar_cadastrar()

# Verifica se arquivo foi executado diretamente.
if __name__ == "__main__":
    # Executa teste.
    test_cadastro_fono()

# pra rodar o teste, no terminal dentro da past front:
# python tests/cadastro_fono_test.py
