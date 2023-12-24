from functools import cache
from transformers import AutoTokenizer, AutoModel
import torch


class EmbeddingsModel:
    def __init__(self):
        pass

    def __getitem__(self, key):
        pass


class DistilBertEmbeddingsModel:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained('distilbert-base-multilingual-cased')
        self.model = AutoModel.from_pretrained('distilbert-base-multilingual-cased')

    @cache
    def __getitem__(self, text):
        try:
            inputs = self.tokenizer(text, return_tensors='pt', truncation=True)
            with torch.no_grad():
                outputs = self.model(**inputs)
            return outputs.last_hidden_state.mean(dim=1)[0]
        except Exception:
            return None

    def batch_get(self, texts):
        try:
            # Batch tokenization
            inputs = self.tokenizer(texts, return_tensors='pt', padding=True, truncation=True)
            
            # Move to GPU if available
            if torch.cuda.is_available():
                inputs = {k: v.to('cuda') for k, v in inputs.items()}
                self.model.to('cuda')

            # Batch model inference
            with torch.no_grad():
                outputs = self.model(**inputs)

            # Extract and return embeddings
            embeddings = outputs.last_hidden_state.mean(dim=1)
            return embeddings.cpu()
        except Exception as e:
            return None
