"""
SPARK Badminton Stroke Recognition Model Architecture.
Verified EXP_22_B / EXP_23_C Architecture:
  Input: [B, 16, 512]
    -> Linear Projection (512 -> 128)
    -> Sinusoidal Positional Encoding
    -> 1-layer Transformer Encoder (d_model=128, nhead=4, d_ff=256)
    -> 1-layer LSTM (input_size=128, hidden_size=128)
    -> final timestep aggregation ('last')
    -> Dropout(0.5)
    -> Linear(5)
  Total Parameters: exactly 330,885.
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class SinusoidalPositionalEncoding(nn.Module):
    def __init__(self, d_model: int = 128, max_len: int = 16):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)  # Shape: [1, max_len, d_model]
        self.register_buffer('pe', pe)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.pe[:, :x.size(1), :]


class TransformerEncoderBlock(nn.Module):
    def __init__(self, d_model: int = 128, nhead: int = 4, dim_feedforward: int = 256, dropout: float = 0.1):
        super().__init__()
        self.norm1 = nn.LayerNorm(d_model)
        self.self_attn = nn.MultiheadAttention(embed_dim=d_model, num_heads=nhead, dropout=dropout, batch_first=True)
        self.norm2 = nn.LayerNorm(d_model)
        self.linear1 = nn.Linear(d_model, dim_feedforward)
        self.dropout = nn.Dropout(dropout)
        self.linear2 = nn.Linear(dim_feedforward, d_model)
        self.dropout2 = nn.Dropout(dropout)
        self.activation = nn.ReLU()

    def forward(self, x: torch.Tensor, need_weights: bool = False):
        x_norm = self.norm1(x)
        attn_out, attn_weights = self.self_attn(x_norm, x_norm, x_norm, need_weights=need_weights, average_attn_weights=True)
        x = x + self.dropout(attn_out)
        
        x_norm2 = self.norm2(x)
        ff_out = self.linear2(self.dropout(self.activation(self.linear1(x_norm2))))
        x = x + self.dropout2(ff_out)
        
        return x, attn_weights


class BadmintonTransformerLSTMClassifier(nn.Module):
    """
    Verified EXP_22_B / EXP_23_C Architecture.
    Total Parameters: exactly 330,885.
    """
    def __init__(
        self,
        input_dim: int = 512,
        d_model: int = 128,
        nhead: int = 4,
        dim_feedforward: int = 256,
        transformer_dropout: float = 0.1,
        lstm_hidden_size: int = 128,
        lstm_layers: int = 1,
        bidirectional: bool = False,
        aggregation: str = "last",
        dropout_p: float = 0.5,
        num_classes: int = 5,
    ):
        super().__init__()
        self.input_dim = input_dim
        self.d_model = d_model
        self.aggregation = aggregation

        self.proj = nn.Linear(input_dim, d_model)
        self.pos_encoder = SinusoidalPositionalEncoding(d_model=d_model, max_len=16)

        self.transformer_block = TransformerEncoderBlock(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=dim_feedforward,
            dropout=transformer_dropout
        )

        self.lstm = nn.LSTM(
            input_size=d_model,
            hidden_size=lstm_hidden_size,
            num_layers=lstm_layers,
            batch_first=True,
            bidirectional=bidirectional
        )

        self.classifier_input_dim = lstm_hidden_size * (2 if bidirectional else 1)
        self.dropout = nn.Dropout(p=dropout_p)
        self.fc = nn.Linear(self.classifier_input_dim, num_classes)

    def forward(self, x: torch.Tensor, return_attention: bool = False):
        h = self.proj(x)
        h = self.pos_encoder(h)
        h_trans, attn_weights = self.transformer_block(h, need_weights=return_attention)
        lstm_out, _ = self.lstm(h_trans)

        if self.aggregation == "last":
            rep = lstm_out[:, -1, :]
        elif self.aggregation == "mean":
            rep = lstm_out.mean(dim=1)
        else:
            rep = torch.max(lstm_out, dim=1)[0]

        rep = self.dropout(rep)
        logits = self.fc(rep)

        if return_attention:
            return logits, attn_weights
        return logits

    def count_parameters(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)
