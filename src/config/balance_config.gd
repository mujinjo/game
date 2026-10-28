class_name BalanceConfig
extends Resource
## Balance values for batting. Implements design/game-brief.md MVP 2 and 7
## (story-001-mouse-aim-batting). Tune in assets/data/balance_default.tres.

@export_group("Pitch")
@export var ball_travel_seconds: float = 0.9
@export var late_swing_grace_seconds: float = 0.2
@export var result_display_seconds: float = 1.2
@export var pitch_interval_seconds: float = 0.8

@export_group("Aim")
## Radius of the aiming circle in pixels; tier aim limits are ratios of this.
@export var aim_radius: float = 70.0
@export var home_run_aim_ratio: float = 0.2
@export var double_aim_ratio: float = 0.4
@export var single_aim_ratio: float = 0.6
@export var out_aim_ratio: float = 0.8
@export var foul_aim_ratio: float = 1.0

@export_group("Timing windows (seconds, absolute error)")
@export var home_run_timing: float = 0.03
@export var double_timing: float = 0.06
@export var single_timing: float = 0.09
@export var out_timing: float = 0.12
@export var foul_timing: float = 0.16

@export_group("Layout and perspective")
@export var pitcher_position: Vector2 = Vector2(640.0, 200.0)
@export var strike_zone_center: Vector2 = Vector2(640.0, 460.0)
@export var strike_zone_size: Vector2 = Vector2(200.0, 240.0)
@export var ball_base_radius: float = 20.0
@export var ball_scale_start: float = 0.2
@export var ball_scale_end: float = 1.0
