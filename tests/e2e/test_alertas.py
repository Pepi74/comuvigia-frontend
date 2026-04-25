import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
import time
import os

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
    d = webdriver.Chrome(service=service, options=options)
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    yield d
    d.quit()


@pytest.fixture
def driver_logged_in(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)
    campo_usuario = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[type='text'].native-input")
    ))
    campo_usuario.send_keys(TEST_USER_ADMIN)
    driver.find_element(By.CSS_SELECTOR, "input[type='password'].native-input").send_keys(TEST_PASSWORD)
    driver.find_element(By.XPATH, "//ion-button[@type='submit'] | //button[@type='submit']").click()
    wait.until(EC.url_contains("/home"))
    time.sleep(2)
    return driver


def test_panel_notificaciones_abre(driver_logged_in):
    driver = driver_logged_in
    wait = WebDriverWait(driver, 15)

    campana = wait.until(EC.element_to_be_clickable(
        (By.CSS_SELECTOR, "ion-button.notification-btn, ion-button[id*='notif'], ion-badge ~ ion-button, ion-button:has(ion-badge)")
    ))
    driver.execute_script("arguments[0].click();", campana)
    time.sleep(1)

    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-07a_notificaciones_abre.png")

    popover = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "ion-popover.hydrated")
    ))
    assert popover is not None


def test_panel_notificaciones_muestra_alertas(driver_logged_in):
    driver = driver_logged_in
    wait = WebDriverWait(driver, 15)

    campana = wait.until(EC.element_to_be_clickable(
        (By.CSS_SELECTOR, "ion-button.notification-btn, ion-button[id*='notif'], ion-button:has(ion-badge)")
    ))
    driver.execute_script("arguments[0].click();", campana)
    time.sleep(1)

    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-07b_notificaciones_lista.png")

    alertas = driver.find_elements(
        By.CSS_SELECTOR, "ion-popover ion-item, ion-popover .alerta-card, ion-popover ion-card"
    )
    assert len(alertas) > 0, "El panel de notificaciones no muestra ninguna alerta"