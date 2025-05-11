import cv2


def cut(image_save_name: str,
        image_path: str,
        image_format: str,
        image_dimensions: tuple[int, int, int, int]
        ) -> None:
    """Crops an image according to the specified dimensions.

    Author: https://github.com/Idkode

    Args:
        image_save_name (str): The name with which the image will be saved
        image_path (str): The path of the image that will be cut
        image_format (str): The image format, i.e. .png, .jpg
        image_dimensions (tuple[int, int, int, int]): The dimensions to cut
        the image. Order is x1, x2, y1, y1 (start and end in horizontal and
        vertical axis, respectively)
    """

    if image_save_name == '' or image_save_name is None:
        image_save_name = image_path
    img = cv2.imread(image_path + image_format)
    x1, x2, y1, y2 = image_dimensions  # Cut dimensions
    cropped_image = img[y1:y2, x1:x2]  # Cut image
    cv2.imwrite(image_save_name + image_format, cropped_image)  # Image save


def image_crop(
        image_save_name: str,
        image_path: str,
        image_format: str,
        image_dimensions: dict[dict]
        ) -> list[str]:
    """Crops an image into one or multiple images,
    according to the specified dimensions.

    Args:
        image_save_name (str): The name with which the image will be saved
        image_path (str): The path of the image that will be cut
        image_format (str): The image format, i.e. .png, .jpg
        image_dimensions (dict[dict]): A dictionary with dictionaries of
        dimensions. There is no specified name for the keys of the sets of
        dimensions, but the dimensions must be named 'x1', 'x2', 'y1', 'y2'
        (start and end in horizontal and vertical axis, respectively)
    """
    images: list[str] = []
    for key in image_dimensions.keys():
        dimensions: tuple[int, int, int, int] = (
            image_dimensions[key]['x1'],
            image_dimensions[key]['x2'],
            image_dimensions[key]['y1'],
            image_dimensions[key]['y2'])
        name: str = image_save_name + '_' + key
        cut(name, image_path,
            image_format, dimensions)
        images.append(name + image_format)

    return images

if __name__ == '__main__':
    cut('cut', 'teste', '.png', (485, 1435, 72, 688))
