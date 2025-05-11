from src.PrintCameras import PrintCameras
import logging
import sys

if __name__ == '__main__':
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)
    logging.info('Starting capture system')
    system = PrintCameras('config.json')
    system.start_prints()
