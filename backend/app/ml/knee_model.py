import torch
import torch.nn as nn
import torchvision.models as models
from app.config import Config

SEQUENCE_LENGTH = 15
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_model_instance = None

def get_model():
    global _model_instance
    if _model_instance is None:
        _model_instance = KneeAngleModel(Config.MODEL_PATH)
    return _model_instance


class TemporalCNNRegressor(nn.Module):
    def __init__(self, seq_len: int = SEQUENCE_LENGTH):
        super().__init__()
        self.seq_len = seq_len

        backbone = models.shufflenet_v2_x1_0(weights=None)
        self.frame_encoder = nn.Sequential(*list(backbone.children())[:-1])
        self.spatial_pool = nn.AdaptiveAvgPool2d(1)

        self.temporal = nn.Sequential(
            nn.Conv1d(1024, 256, kernel_size=5, padding=2),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Conv1d(256, 128, kernel_size=3, padding=1),
            nn.BatchNorm1d(128),
            nn.ReLU(inplace=True),
        )

        self.head = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(64, 1),
        )

    def forward(self, x):
        # x: (B, T, 3, H, W)
        B, T, C, H, W = x.shape
        frames      = x.view(B * T, C, H, W)
        features    = self.frame_encoder(frames)
        embeddings  = self.spatial_pool(features).squeeze(-1).squeeze(-1)
        embeddings  = embeddings.view(B, T, 1024).permute(0, 2, 1)   # (B, 1024, T)
        temporal_out = self.temporal(embeddings)                       # (B, 128, T)
        pooled       = temporal_out.mean(dim=-1)                       # (B, 128)
        return self.head(pooled).squeeze(1)                            # (B,)


class KneeAngleModel:
    def __init__(self, model_path):
        self.device = DEVICE
        self.model = TemporalCNNRegressor(seq_len=SEQUENCE_LENGTH).to(self.device)
        self.model.load_state_dict(
            torch.load(model_path, map_location=self.device)
        )
        self.model.eval()

    def predict(self, input_tensor: torch.Tensor) -> float:
        """
        Args:
            input_tensor: (1, SEQUENCE_LENGTH, 3, H, W) — preprocessed & normalized
        Returns:
            Predicted knee angle in degrees
        """
        input_tensor = input_tensor.to(self.device)
        with torch.no_grad():
            output = self.model(input_tensor)
        return float(output.item() * 180.0)