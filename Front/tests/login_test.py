from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import time

from pages.login_page import LoginPage

def test_login():
    options = Options()
    options.add_experimental_option("detach", True)

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    driver.get("http://localhost:5173/")
    driver.maximize_window()

    page = LoginPage(driver)

    time.sleep(2)

    # Adicionar email e senha do cadastro
    page.preencher_email("")
    page.preencher_senha("")

    time.sleep(2)

    page.clicar_entrar()

    # Espera para ver o modal
    time.sleep(5)

if __name__ == "__main__":
    test_login()
