import torch
import torch.nn as nn
import torchvision.models as models
from app.config import Config

SEQUENCE_LENGTH = 9
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_model_instance = None

def get_model():
    global _model_instance
    if _model_instance is None:
        _model_instance = KneeAngleModel(Config.MODEL_PATH)
    return _model_instance

class CNNRegressor(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = models.resnet18(
            weights=models.ResNet18_Weights.IMAGENET1K_V1
        )
        old_conv = self.backbone.conv1
        self.backbone.conv1 = nn.Conv2d(
            in_channels=3 * SEQUENCE_LENGTH,
            out_channels=old_conv.out_channels,
            kernel_size=old_conv.kernel_size,
            stride=old_conv.stride,
            padding=old_conv.padding,
            bias=False
        )
        with torch.no_grad():
            for i in range(SEQUENCE_LENGTH):
                self.backbone.conv1.weight[:, 3*i:3*(i+1), :, :] = (
                    old_conv.weight / SEQUENCE_LENGTH
                )
        self.backbone.fc = nn.Linear(self.backbone.fc.in_features, 1)

    def forward(self, x):
        return self.backbone(x).squeeze(1)


class KneeAngleModel:
    def __init__(self, model_path):
        self.device = DEVICE
        self.model = CNNRegressor().to(self.device)
        self.model.load_state_dict(
            torch.load(model_path, map_location=self.device)
        )
        self.model.eval()

    def predict(self, input_tensor):
        input_tensor = input_tensor.to(self.device)
        with torch.no_grad():
            output = self.model(input_tensor)
        # output is in [0,1] normalized — convert back to degrees
        return float(output.item() * 180.0)
    