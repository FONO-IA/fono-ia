from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

from pages.login_page import LoginPage
from pages.home_page import HomePage


def test_home():
    options = Options()
    options.add_experimental_option("detach", True)

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    wait = WebDriverWait(driver, 10)

    driver.get("http://localhost:5173/")
    driver.maximize_window()

    login = LoginPage(driver)
    home = HomePage(driver)

    wait.until(EC.presence_of_element_located(("id", "email-pro")))

    # LOGIN
    time.sleep(1)
    login.preencher_email("teste444@email.com")
    time.sleep(1)
    login.preencher_senha("11111111")
    login.clicar_entrar()

    # espera redirecionar
    wait.until(EC.url_contains("/admin"))

    # abre card do paciente
    time.sleep(1)
    home.clicar_card_paciente()

    # cria exercício
    time.sleep(1)
    home.clicar_criar_exercicio()

    time.sleep(1)
    home.clicar_ajuda_ia()

    time.sleep(1)
    home.sugestao_categoria("frutas")

    time.sleep(1)
    home.clicar_gerar_segestao()

    time.sleep(3)


if __name__ == "__main__":
    test_home()
