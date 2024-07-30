FROM python:3.12

ARG USERNAME=user
ARG PROJECT_NAME=ml

RUN useradd -m $USERNAME \
    && apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y \
        coreutils \
        sudo \
        git \
        gcc \
        g++ \
        make \
        cmake \
    && usermod -aG sudo user \
    && echo "$USERNAME ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

USER $USERNAME

RUN git config --global user.email "fabioja@insper.edu.br"
RUN git config --global user.name "Fabio Ayres"

RUN mkdir /home/$USERNAME/$PROJECT_NAME
RUN mkdir -p /home/$USERNAME/.local/bin

WORKDIR /home/$USERNAME/$PROJECT_NAME
