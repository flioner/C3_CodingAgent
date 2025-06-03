# 🧠 MARE: Mindful Agent for Resolving Exceptions

A multi-agent AI system designed to autonomously resolve complex Object-Oriented Programming (OOP) issues in GitHub repositories. MARE integrates multiple components — terminal-based SWE-agent, Open Hands web UI, and RooCode in VS Code — all orchestrated within a Docker environment and powered by various language models.

## 👥 Team 33

    Emilio Berber Maldonado – Compiler Designer

    Alfonso Ramirez Alvarado – Compiler Designer

    Juan Zambrano Barajas – AI Model Fine Tuning

    Andrea Núñez García – AI Model Fine Tuning

    Fabian Lioner Rocha – LLM Integration Specialist

## 🧩 Project Components

    SWE-agent (CLI): Terminal agent for automated code repair using SWE-bench.

    Open Hands (Web UI): Web-based interface for interacting with LLMs.

    RooCode (VS Code): In-editor code assistant integrated into Visual Studio Code.

    Ollama: LLM Provider.

## 🏗 Architecture

Multi-agent system powered by:

    Ollama – Local LLM runtime

    Docker – Containerized deployment for all components

    Python – Core logic and integration

    Qwen, Gemma, Devstral, Unsloth – Fine-tuned and foundation models

## 🧪 Evaluation

The system was tested on SWE-bench LITE, showcasing strong performance with fine-tuned Qwen3.
🎬 Demos

    Open Hands (Gemma 3)

    SWE-agent (Qwen 3 Fine-Tuned)

    RooCode (Claude 4)

## 🛠️ SWE-agent Installation

To install SWE-agent from source, follow the steps below:

```bash
# Clone the repository
git clone https://github.com/SWE-agent/SWE-agent.git
cd SWE-agent

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Upgrade pip and install SWE-agent in editable mode
python -m pip install --upgrade pip
pip install --editable .

# Run SWE-agent on the SWE-bench Lite test split
sweagent run-batch \
    --config config/ollama.yaml \
    --instances.type swe_bench \
    --instances.subset lite \
    --instances.split test
```

## 🐳 Run Ollama with GPU via Docker Compose

```bash
# Clone the repo
git clone https://github.com/mythrantic/ollama-docker.git
cd ollama-docker

# Install NVIDIA Container Toolkit for GPU support
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Test GPU integration (optional)
docker run --gpus all nvidia/cuda:11.5.2-base-ubuntu20.04 nvidia-smi

# Run Ollama with GPU
docker compose -f docker-compose-ollama-gpu.yaml up -d
```

## 🙌 Run the Open Hands AI Agent

To start the Open Hands app, simply run:

```bash
docker-compose up
```

## Jupyter Notebook Docker Compose Setup for Fine-Tuning

Clone repo and create notebooks folder:

```bash
git clone https://github.com/nezhar/jupyter-docker-compose
cd jupyter-docker-compose
mkdir notebooks
```

Download example notebooks into `notebooks/` folder from Unsloth:

- [Fine Tune Gemma3 (4B) - FineTomme](<https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Gemma3_(4B).ipynb>)
- [Fine Tune Qwen3 (14B) - Alpaca](<https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen3_(14B)-Alpaca.ipynb#scrollTo=vITh0KVJ10qX>)

Start Jupyter Notebook with Docker Compose:

```bash
docker compose up --build
```

Search datasets on Hugging Face: https://huggingface.co/datasets

Load datasets in notebooks via:

```bash
from datasets import load_dataset
dataset = load_dataset("dataset_name")
```

## Video Presentation

<iframe width="560" height="315" src="https://www.youtube.com/embed/d53niIlK13w" title="YouTube video player" frameborder="0" allowfullscreen></iframe>

## Presentation PDF

You can download the presentation PDF here: [Presentation.pdf](./Presentation/C3_FinalPresentation_Team33.pdf)
