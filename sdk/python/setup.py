from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="erebus-sdk",
    version="1.0.0",
    author="Erebus Protocol",
    author_email="dev@erebusprotocol.io",
    description="Official Python SDK for Erebus Protocol - Zero-Knowledge Privacy Layer for Solana",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/erebus-protocol/erebus-privacy",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.9",
    install_requires=[
        "httpx>=0.25.0",
        "solders>=0.18.0",
    ],
    extras_require={
        "dev": ["pytest>=7.0.0", "pytest-asyncio>=0.21.0"],
    },
)
