from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class HomePage:

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def clicar_novoPaciente(self):
        botao = self.wait.until(
            EC.element_to_be_clickable((By.ID, "btn-novo-paciente"))
        )
        botao.click()

    def preencher_nome_responsavel(self, nome):
        campo = self.wait.until(
            EC.presence_of_element_located((By.ID, "nome-responsavel"))
        )
        campo.send_keys(nome)

    def preencher_cpf(self, cpf):
        self.driver.find_element(By.ID, "cpf").send_keys(cpf)

    def preencher_telefone(self, telefone):
        self.driver.find_element(By.ID, "telefone").send_keys(telefone)

    def preencher_email(self, email):
        self.driver.find_element(By.ID, "email").send_keys(email)

    def preencher_senha(self, senha):
        self.driver.find_element(By.ID, "senha-responsavel").send_keys(senha)

    def preencher_confirmar_senha(self, senha):
        self.driver.find_element(
            By.ID,
            "confirmar-senha-responsavel"
        ).send_keys(senha)

    def preencher_nome_paciente(self, nome):
        self.driver.find_element(
            By.ID,
            "nome-paciente"
        ).send_keys(nome)

    def preencher_data_nascimento(self, data):
        self.driver.find_element(
            By.ID,
            "data-nascimento"
        ).send_keys(data)

    def preencher_observacoes(self, observacoes):
        self.driver.find_element(
            By.ID,
            "observacoes"
        ).send_keys(observacoes)

    def clicar_cadastrar(self):
        botao = self.wait.until(
            EC.element_to_be_clickable(
                (By.ID, "btn-cadastrar-responsavel")
            )
        )
        botao.click()

    def clicar_encerrar(self):
        botao = self.wait.until(
            EC.element_to_be_clickable((By.ID, "btn-encerrar"))
        )
        botao.click()

    def clicar_card_paciente(self):
        botao = self.wait.until(
            EC.element_to_be_clickable((By.ID, "btn-card-paciente"))
        )
        botao.click()

    def clicar_criar_exercicio(self):
        botao = self.wait.until(
            EC.element_to_be_clickable((By.ID, "btn-criar-exercicio"))
        )
        botao.click()

    def preencher_nome_exercicio(self, nome):
        self.wait.until(
            EC.presence_of_element_located((By.ID, "nome-exercicio"))
        ).send_keys(nome)

    def preencher_categoria(self, categoria):
        self.driver.find_element(By.ID, "categoria").send_keys(categoria)

    def preencher_objetivo(self, objetivo):
        self.driver.find_element(By.ID, "objetivo").send_keys(objetivo)

    def preencher_conteudo(self, conteudo):
        self.driver.find_element(By.ID, "conteudo").send_keys(conteudo)

    def preencher_instrucoes(self, instrucoes):
        self.driver.find_element(By.ID, "instrucoes").send_keys(instrucoes)

    def clicar_salvar_exercicio(self):
        botao = self.wait.until(
            EC.element_to_be_clickable((By.ID, "btn-salvar-exercicio"))
        )
        botao.click()

    def clicar_ok_modal(self):
        botao = self.wait.until(
            EC.element_to_be_clickable((By.ID, "btn-ok"))
        )
        botao.click()

    def clicar_voltar(self):
        botao = self.wait.until(
            EC.element_to_be_clickable((By.ID, "btn-voltar"))
        )
        botao.click()

    def clicar_card_exercicio_cadastrado(self):
        botao = self.wait.until(
            EC.element_to_be_clickable(
                (By.ID, "btn-card-exercicio-cadastrado")
            )
        )
        botao.click()
