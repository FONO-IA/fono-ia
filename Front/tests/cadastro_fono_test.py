from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import time
from pages.cadastro_page import CadastroPage


# Função que usa o CadastroPage pra abrir o navegador, acessar o sistema e executar o fluxo de teste.
def test_cadastro_fono():

    options = Options()
    options.add_experimental_option("detach", True)

    # baixa automaticamente o ChromeDriver correto e configura o caminho.
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(options=options)

    driver.get("http://localhost:5173/cadastro-fono")
    driver.maximize_window()

    page = CadastroPage(driver)

    time.sleep(2)

    page.preencher_nome("Fono Teste")
    page.preencher_cpf("12345678999")
    page.preencher_crfa("123-PA")
    page.preencher_telefone("00999999999")
    page.preencher_email("fono01@email.com")

    time.sleep(2)

    page.clicar_cadastrar()

if __name__ == "__main__":
    test_cadastro_fono()

# pra rodar o teste, no terminal dentro da past front:
# python tests/cadastro_fono_test.py
