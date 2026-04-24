import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time
import os
from dotenv import load_dotenv

load_dotenv()
BASE_URL = os.environ.get("BASE_URL", "").strip()
TEST_USER_ADMIN = os.environ.get("TEST_USER_ADMIN", "").strip()
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "").strip()
SCREENSHOTS_DIR = "tests/e2e/screenshots"

@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    yield driver
    driver.quit()

def test_login_valido(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)

    campo_usuario = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[type='text'].native-input")
    ))
    campo_usuario.send_keys(TEST_USER_ADMIN)

    campo_contrasena = driver.find_element(
        By.CSS_SELECTOR, "input[type='password'].native-input"
    )
    campo_contrasena.send_keys(TEST_PASSWORD)

    driver.find_element(By.XPATH, "//ion-button[@type='submit'] | //button[@type='submit']").click()

    time.sleep(2)
    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-01_login_valido.png")

    assert BASE_URL + "/login" not in driver.current_url

def test_login_invalido(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)

    campo_usuario = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[type='text'].native-input")
    ))
    campo_usuario.send_keys(TEST_USER_ADMIN)

    campo_contrasena = driver.find_element(
        By.CSS_SELECTOR, "input[type='password'].native-input"
    )
    campo_contrasena.send_keys("asdasdasdasdasdasd")

    driver.find_element(By.XPATH, "//ion-button[@type='submit'] | //button[@type='submit']").click()

    time.sleep(2)
    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-02_login_invalido.png")

    assert "login" in driver.current_url.lower() or driver.current_url == BASE_URL + "/"