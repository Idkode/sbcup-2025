# Monitoramento Inteligente de Tempo Real para Tráfego Urbano em Cidades Brasileiras

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](http://creativecommons.org/publicdomain/zero/1.0/)

* [![Angular][Angular.io]][Angular-url]
* [![Spring Boot][Spring.io]][Angular-url]
* [![Python][Python.org]][Python-url]
* [![Ultralytics][Ultralytics.com]][Ultralytics-url]

## Related Paper

If you use this code in your research, please cite the following paper:

> [**Monitoramento Inteligente de Tempo Real para Tráfego Urbano em Cidades Brasileiras**]()

## Overview

> This project demonstrates a multi-service application leveraging Docker Compose. It features an Angular frontend for user interaction, a Spring Boot backend for API services, a Python monitoring service that uses selenoid for data collection, and a YOLO model service for vehicle detection in the obtained images. 

## Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Service Details](#service-details)
  - [Angular Frontend](#angular-frontend)
  - [Spring Boot Backend](#spring-boot-backend)
  - [Selenium Service](#selenium-service)
  - [YOLO Model Service](#yolo-model-service)
- [Additional Information](#additional-information)
    - [License](#license)
    - [Contact](#contact)
- [Authors](#authors)
## Technologies Used

- **Frontend:** Angular 19.2.6
- **Backend:** Spring Boot 3.4.4, Java 17
- **Image collection:** Python 3.13.3
- **AI/ML:** YOLO v11 (Ultralytics), Python 3.13.3
- **Containerization:** Docker, Docker Compose
- **Operating System (Developed/Tested On):** Debian 12 (Bookworm), Ubuntu 22.04 (Jammy) Server

## Prerequisites

To run this project, you need to install Docker (and Docker Compose) on your machine.

- **Docker Engine:** [Docker Engine](https://docs.docker.com/engine/install/)
- **Optional (for development):**
    - Node.js v18.19.0 and npm 9.2.0 (for Angular development) [Link to Node.js installation](https://nodejs.org/en/download)
    - Java Development Kit (JDK) 17
    - Python and pip (for YOLO and monitoring services).

All python development was made using conda 25.1.1

## Getting Started

To get a local copy up and running, follow the steps below.

### Installation

1.  **Clone the repository:**
    
    With https:
    ```bash
    git clone https://github.com/Idkode/sbcup-2025.git
    cd sbcup-2025
    ```

    With ssh:
    ```bash
    git clone git@github.com:Idkode/sbcup-2025.git
    cd sbcup-2025
    ```

### Configuration

All steps below presume that your user has permission to use docker commands without sudo (for Linux).

### Running the Application

Run the services using docker compose. Old docker installations might use a different command (docker-compose)

1.  **Build and start the services:**
    ```bash
    docker compose up --build -d
    ```
    This command might take a while to run, since all images and dependencies will be installed. Also beware that some images, especially the python ones, take a lot of memory space due to the amount of dependencies. 

2.  **Accessing the applications:**
    - **Angular Frontend:** Typically accessible at `http://localhost:81`
    - **Spring Boot Backend:** Typically accessible at `http://localhost:8081/api` (externally from docker network)
    - **Selenium Service:** The selenium module is exclusively used by the monitoring service. Selenoid-UI can be accessed from `http://localhost:8080` to check the selenoid sessions. Selenoid-UI is an optional service.
    - **YOLO Model Service:** This service has only one endpoint at `http://localhost:8000/detect`. Backend sends requests to this endpoint to get the images' detections.

3.  **Stopping the services:**
    ```bash
    docker compose stop
    ```

    Or if you want to remove the containers:
    ```bash
    docker compose down
    ```


## Service Details

Now, here is a brief explanation about each of the services.

### Angular Frontend

- This is the interface between the user and the cameras monitoring.
- As of now, only a dashboard page and a simple settings page are available.
- Depends on backend, model and monitoring services.
- Needs images collected from at least one camera to actually work.

### Spring Boot Backend

- Responsible for saving the images from the monitoring service, sending images to the model to get Detections and supplying data to frontend.
- Uses Spring Boot. Interacts with mongo database to save the images' data and detections.
- As of now, only Image endpoints are available. They can be checked at the ImageController class.

### Monitoring Service

- Configuration files are config.json and cameras.json.
- For monitoring purposes, jobType needs to be parallel.
- With the current configurations, the limit of cameras is 5. To increase the number, the limit would need to be altered in the selenoid service.
- Before running, it is recommended to check if the camera links are still valid, since most of them are changed periodically

### Selenoid Service

- Manages selenium sessions created by the monitoring service.
- Has a limit of 5 concurrent sessions, but can be altered through compose configurations.
- Beware that increasing the limit might increase CPU and memory usage
- Uses a custom firefox image to ensure correct images collection in some websites.

### YOLO Model Service

- Runs a YOLO model to process images and return detections. Since GPU configuration differs for each machine, it uses CPU for inference as of now.


## Additional information

### License

This project is dedicated to the public domain under the Creative Commons Zero v1.0 Universal license.

### Contact

For inquiries or additional information, please contact us via email: [Carlos Loureiro](mailto:cenlf.eng22@uea.edu.br) and [Elloá B. Guedes](ebgcosta@uea.edu.br).

### Acknowledgements

The authors would like to express their gratitude for the financial support provided by the Research Support Foundation of the State of Amazonas (FAPEAM), through the PAIC programs for the years 2024/2025. They also acknowledge the material support received from the Laboratory of Intelligent Systems (LSI) at the Amazonas State University (UEA).

## Authors

- Carlos Loureiro: [@Idkode](https://github.com/Idkode)
- Elloá B. Guedes: [@elloa](https://github.com/elloa)


[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Python.org]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[Ultralytics.com]: https://img.shields.io/badge/Ultralytics-F5F5F5?style=for-the-badge&logo=ultralytics&logoColor=black
[Ultralytics-url]: https://ultralytics.com/
[Spring.io]: https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white
[Spring-url]: https://spring.io/projects/spring-boot
