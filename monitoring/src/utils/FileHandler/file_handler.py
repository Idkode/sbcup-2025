import json
import os


def retrieve_file_contents(file_path: str) -> dict:
    """Opens a .json file, loads its contents and returns
       them as a dictionary.

    Author: https://github.com/Idkode

    Args:
        file_path (str): The name of the .json file, including its path.

    Returns:
        dict: The contents of the file
    """
    with open(file_path, 'r') as file:
        file_contents = json.load(file)
    return file_contents


def manage_dir(path: str) -> str:
    """Checks if a directory exists.
    If it does not exist, it will be created.

    Author: https://github.com/Idkode

    Args:
        path (str): The path of the directory

    Returns:
        str: Returns the path of the directory
    """
    pasta = path
    if (not os.path.isdir(pasta)):
        os.mkdir(pasta)
    return pasta


def delete_path(path: str):
    """Checks if a path exists. If it does, it is deleted.

    Author: https://github.com/Idkode

    Args:
        path (str): The path to remove
    """
    if os.path.exists(path):
        os.remove(path)
