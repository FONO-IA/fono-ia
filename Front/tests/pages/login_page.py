from selenium.webdriver.common.by import By

class LoginPage:

    def __init__(self, driver):
        self.driver = driver

    def preencher_email(self, email):
        self.driver.find_element(By.ID, "email-pro").send_keys(email)

    def preencher_senha(self, senha):
        self.driver.find_element(By.ID, "senha-pro").send_keys(senha)

    def clicar_entrar(self):
        self.driver.find_element(By.ID, "btn-login-pro").click()
