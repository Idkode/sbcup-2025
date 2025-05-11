from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import (ElementClickInterceptedException,
                                        NoSuchElementException)
import time
from datetime import datetime
from ..utils import get_timestamp
import logging


class Explorer:
    """A class to build a selenium Firefox Profile.
    With the method print_camera, it is possible to
    play the video and print the explorer screen.
    Explorer uses selenoid docker to access the video links.

    Methods:
    print_camera
    """

    def __init__(self) -> None:
        Explorer.__build_options(self)

    def __build_options(self) -> None:
        options: Options = Options()
        profile = webdriver.FirefoxProfile()
        options.set_capability("selenoid:options",
                               {"enableVNC": True})
        profile.set_preference(
            "media.videocontrols.picture-in-picture.enabled",
            False)
        options.profile = profile
        self.__options = options

    def print_camera(self, camera_link: str, play_element: str,
                     element_type: str, image_name: str,
                     image_format: str,
                     selenoid_url: str,
                     timestamp: datetime = None) -> None:
        """Creates a selenium webdriver instance,
        accesses a video, plays it and prints it.

        Args:
            camera_link (str): The video link
            play_element (str): The 'name' of the element needed to play the
            video
            element_type (str): The type of 'play_element', i.e. ID, XPATH
            image_name (str): The name with which to save the image.
            image_format (str): The image format, i.e. .png, .jpg
            selenoid_url (str): Selenoid's url for execution
        """
        logging.info(f'Starting capture for {image_name} {get_timestamp()}')
        driver: webdriver.Remote = webdriver.Remote(
            command_executor=selenoid_url,
            options=self.__options
        )
        driver.get(camera_link)
        driver.maximize_window()  # Fullscreen
        time.sleep(15)  # Window loading time

        video = driver.find_element(getattr(By, element_type), play_element)
        time.sleep(1)
        try:
            video.click()  # Video play
        except ElementClickInterceptedException:
            driver.execute_script("arguments[0].click();", video)
        time.sleep(5)
        if timestamp:
            remaining = (timestamp - get_timestamp()).total_seconds()
            if remaining > 0:
                time.sleep(remaining)
        driver.save_screenshot(image_name + image_format)
        driver.close()


if __name__ == '__main__':
    explorer = Explorer()
    explorer.print_camera('https://servicos.barueri.sp.gov.br/cameras',
                          '/html/body/div/div[2]/div[1]/div[4]/img[14]',
                          'XPATH',
                          'teste',
                          ".png",
                          "http://localhost:4444/wd/hub")
