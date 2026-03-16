import torch
from PIL import Image
import torchvision.transforms as transforms

SEQUENCE_LENGTH = 9

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def preprocess_input(frame_paths):
    """
    frame_paths: list[str] of 9 image paths

    Returns:
        tensor shape (1, 27, 224, 224)
    """

    if len(frame_paths) != SEQUENCE_LENGTH:
        raise ValueError(f"Expected {SEQUENCE_LENGTH} frames")

    imgs = []

    for path in frame_paths:
        img = Image.open(path).convert("RGB")
        img = transform(img)
        imgs.append(img)

    stacked = torch.cat(imgs, dim=0)  # (27,224,224)

    return stacked.unsqueeze(0)  # (1,27,224,224)