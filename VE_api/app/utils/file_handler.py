"""
File handling utilities
"""

import hashlib
import os
import tempfile
from pathlib import Path


class FileHandler:
    """Utilitário para manipulação de arquivos"""

    @staticmethod
    def get_file_hash(file_bytes: bytes) -> str:
        """
        Calcula hash SHA-256 do arquivo.

        Args:
            file_bytes: Bytes do arquivo

        Returns:
            str: Hash hexadecimal
        """
        return hashlib.sha256(file_bytes).hexdigest()

    @staticmethod
    def save_temp_file(file_bytes: bytes, suffix: str = '.wav') -> str:
        """
        Salva bytes em arquivo temporário e retorna caminho.

        Args:
            file_bytes: Bytes do arquivo
            suffix: Sufixo do arquivo

        Returns:
            str: Caminho do arquivo temporário
        """
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(file_bytes)
            return temp.name

    @staticmethod
    def cleanup_temp_file(file_path: str):
        """
        Remove arquivo temporário.

        Args:
            file_path: Caminho do arquivo a remover
        """
        if os.path.exists(file_path):
            os.unlink(file_path)

    @staticmethod
    def ensure_directory(directory_path: str):
        """
        Cria diretório se não existir.

        Args:
            directory_path: Caminho do diretório
        """
        Path(directory_path).mkdir(parents=True, exist_ok=True)
