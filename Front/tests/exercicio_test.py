from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

from pages.login_page import LoginPage


def test_exercicio():
    options = Options()
    options.add_experimental_option("detach", True)

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    driver.get("http://localhost:5173/")
    driver.maximize_window()

    page = LoginPage(driver)

    # Abre portal do paciente
    time.sleep(2)
    page.clicar_portal_paciente()

    # Faz login
    time.sleep(2)
    page.preencher_email_paciente("seu_email")
    page.preencher_senha_paciente("sua_senha")

    time.sleep(2)
    page.clicar_entrar_paciente()

    # Espera carregar a home
    time.sleep(2)

    # Clica no card do exercício
    # Troque o ID abaixo pelo ID real do card
    driver.find_element(By.ID, "card-exercicio").click()

    # Espera abrir tela do exercício
    time.sleep(2)

    # Clica no botão de gravar áudio

    driver.find_element(By.ID, "btn-iniciar-gravacao").click()

    # Grava por 3 segundos
    time.sleep(3)

    # Clica novamente para parar gravação
    driver.find_element(By.ID, "btn-iniciar-gravacao").click()

    # Espera final para visualizar
    time.sleep(5)


if __name__ == "__main__":
    test_exercicio()