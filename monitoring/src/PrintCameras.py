from .Explorer import Explorer
from .BackendIntegration import BackendIntegration
from . import utils
import time
from datetime import datetime
import multiprocessing
import os
import logging


class PrintCameras:
    """A class to access and print one 
    or multiple cameras with various settings.\n
    Needs a config.json to initialize.\n
    The config.json must have the format:\n
    cameras_file_path (str): The path to the .json file with the cameras' info,
    storage_path (str): The path to the folder the images will be saved in,
    photo_interval (int): The time between prints,
    camera_interval (int): The time a camera will be accessed until it changes to the next one,
    max_run_time (int): The total time until the program ends,
    image_format (str): The image format, i.e. .png, .jpg,
    cameras (list[str]): The list of cameras to iterate and print,
    job_type (str): The way the app will print cameras (parallel or default),
    selenoid (str): Selenoid url for selenium to use.\n
    Only needed if 'SELENOID_URL' env variable is not set\n
    Author: https://github.com/Idkode

    Methods:\n
    load_config() -> None
    update_config_path(config_path: str) -> str
    reload_cameras() -> None
    get_file_name(camera: str) -> str
    start_prints() -> None
    """

    def __init__(self, config_path: str) -> None:
        self.__config: str = config_path
        PrintCameras.load_config(self)
        self.__explorer = Explorer()
        self.__cameras: dict = utils.retrieve_file_contents(
            self.__cameras_path)
        self.__check_directories()
        self.__backend = BackendIntegration()
        if not self.__backend.is_valid:
            self.__backend = None
        self.__now = utils.get_timestamp()

    def load_config(self) -> None:
        config: dict = utils.retrieve_file_contents(self.__config)
        self.__cameras_path: str = config["cameras_file_path"]
        self.__photo_interval: int = config["photo_interval"]
        self.__camera_interval: int = config["camera_interval"]
        self.__storage: str = config["storage_path"]
        self.__max_run_time: int = config["max_run_time"]
        self.__cameras_to_print: list[str] = config["cameras"]
        self.__image_format: str = config["image_format"]
        self.__job_type: str = config["job_type"]
        selenoid = os.environ.get('SELENOID_URL')
        self.__selenoid: str = selenoid if selenoid else config["selenoid"]
        self.__multiple: int = config["multiple"]

    def update_config_path(self, config_path: str) -> str:
        self.__config = config_path
        self.load_config(self)
        self.__explorer = Explorer()

    def reload_cameras(self) -> None:
        self.__cameras: dict = utils.retrieve_file_contents(
            self.__cameras_path)
        self.__check_directories()

    def __check_directories(self):
        for k in self.__cameras.keys():
            utils.manage_dir(self.__storage + k)

    def __get_file_name(self, camera: str,
                        timestamp: datetime = None) -> str:
        root = self.__storage + camera + '/'
        today = utils.get_timestamp()
        today_date = today.strftime('%Y-%m-%d')
        todays_folder = utils.manage_dir(root + today_date)
        timestamp = (
            today.strftime('%Y-%m-%d-%H-%M-%S')
            if not timestamp
            else timestamp.strftime('%Y-%m-%d-%H-%M-%S'))
        name = todays_folder + '/' + camera + '_' + timestamp
        return name

    def __build_data(self, image: str, camera: str, index: int):
        return {
            'name': image,
            'camera': self.__cameras[camera]["dimensions"][str(index)]["alias"],
            'date': self.__current.strftime('%Y-%m-%d'),
            'time': self.__current.strftime('%H-%M-%S')
        }

    def __add_to_queue(self, queue: multiprocessing.Queue,
                       obj_list: list, camera: str):
        index = 1
        for item in obj_list:
            queue_item = self.__build_data(item, camera, index)
            queue.put(queue_item)
            index += 1

    def __send_queue_data(self, queue: multiprocessing.Queue):
        while True:
            try:
                item: dict = queue.get(block=False)
                result = self.__backend.send_request(item)
                if result:
                    utils.delete_path(item['name'])
            except Exception as e:
                logging.error(e)
                return

    def __print_camera(self, camera: str, timestamp: datetime = None,
                       queue: multiprocessing.Queue = None) -> None:
        if self.__camera_interval > 0:
            self.__now = utils.get_timestamp()
            end_time = utils.get_timestamp(self.__camera_interval)
            while self.__now < end_time and self.__now < self.__run_time_end:
                self.__explorer.print_camera(self.__cameras[camera]['link'],
                                             self.__cameras[camera]['play_element'],
                                             self.__cameras[camera]['element_type'],
                                             camera,
                                             self.__image_format,
                                             selenoid_url=self.__selenoid,
                                             timestamp=timestamp)
                name = self.__get_file_name(camera, timestamp)
                dimensions = self.__cameras[camera]['dimensions']
                images = utils.image_crop(name, camera, self.__image_format,
                                          dimensions)
                if queue:
                    self.__add_to_queue(queue, images, camera)
                utils.delete_path(camera + self.__image_format)
                time.sleep(self.__photo_interval)
                self.__now = utils.get_timestamp()

    def start_prints(self) -> None:
        """
        The only option that sends images to backend is parallel.
        Parallel has a limit of 5 cameras due to memory and cpu usage.
        """
        n: int = len(self.__cameras_to_print)
        if self.__job_type == 'parallel' and n <= 5:
            if not self.__backend:
                logging.info(self.__backend)
                exit(-1)
            self.__photo_interval = 0
            self.__current = utils.get_start_time(self.__multiple)
            time.sleep(utils.get_interval(self.__current) - 40)
            self.__run_time_end = utils.get_timestamp(self.__max_run_time)
            ctx = multiprocessing.get_context()
            queue = ctx.Queue()
            while self.__now < self.__run_time_end:
                processes: list[multiprocessing.Process] = []
                logging.info('Starting processes')
                for camera in self.__cameras_to_print:
                    process = multiprocessing.Process(
                        target=self.__print_camera,
                        args=(camera, self.__current, queue))
                    processes.append(process)
                    process.start()

                for _ in processes:
                    _.join()

                self.__send_queue_data(queue)

                self.__now = utils.get_timestamp()
                self.__current = utils.get_timestamp(0,
                                                     self.__multiple,
                                                     self.__current)
                time.sleep(utils.get_interval(self.__current) - 40)
                logging.info(f'Out of sleep {utils.get_timestamp()}')

        else:
            current: int = 0
            self.__now = utils.get_timestamp()
            self.__run_time_end = utils.get_timestamp(self.__max_run_time)
            while self.__now < self.__run_time_end:
                self.__print_camera(self.__cameras_to_print[current])
                current = (current + 1) % n
                self.__now = utils.get_timestamp()


if __name__ == '__main__':
    system = PrintCameras('config.json')
    system.start_prints()
