import requests
import os
import mimetypes
import logging


class BackendIntegration:
    """A class to deal with connection to backend endpoints.
    Needs the env variables 'SERVER_URL' and 'SERVER_IMAGE_ENDPOINT'
    to comunicate.
    """

    def __init__(self):
        self.__server_url: str = os.environ.get('SERVER_URL')  # Backend url
        self.__endpoint: str = os.environ.get('SERVER_IMAGE_ENDPOINT')  # Endpoint for uploading images

    @property
    def is_valid(self) -> bool:
        return (self.__server_url is not None and
                self.__endpoint is not None)

    def send_request(self, image_data: dict) -> bool:
        logging.info('sending request to backend')
        with open(image_data['name'], mode='rb') as image:
            type = mimetypes.guess_type(image.name)
            files = {
                'image': (image.name, image, type)
            }

            try:
                response = requests.post(self.__server_url + self.__endpoint,
                                         files=files,
                                         data=image_data)
                response.raise_for_status()

                logging.info(f'Image {image.name} sent to the server')
                return True

            except requests.exceptions.RequestException as e:
                logging.error(f'Image {image.name} could not be sent to' +
                              f' server due to {e}')
                return False
