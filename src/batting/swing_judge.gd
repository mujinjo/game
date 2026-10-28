class_name SwingJudge
extends RefCounted
## Pure swing judgement. Implements design/game-brief.md MVP 2
## (story-001-mouse-aim-batting). No Node dependencies; testable in isolation.

enum Result { WHIFF, FOUL, GROUNDOUT, FLYOUT, SINGLE, DOUBLE, HOME_RUN, NO_SWING }

## aim_error: distance (px) between aim circle center and ball arrival point.
## timing_error: click time minus ball arrival time (seconds); negative = early.
## NO_SWING is never returned here; the caller decides it.
func judge(aim_error: float, timing_error: float, config: BalanceConfig) -> Result:
	var aim: float = absf(aim_error)
	var timing: float = absf(timing_error)
	if _within(aim, timing, config.home_run_aim_ratio, config.home_run_timing, config):
		return Result.HOME_RUN
	if _within(aim, timing, config.double_aim_ratio, config.double_timing, config):
		return Result.DOUBLE
	if _within(aim, timing, config.single_aim_ratio, config.single_timing, config):
		return Result.SINGLE
	if _within(aim, timing, config.out_aim_ratio, config.out_timing, config):
		return Result.GROUNDOUT if timing_error > 0.0 else Result.FLYOUT
	if _within(aim, timing, config.foul_aim_ratio, config.foul_timing, config):
		return Result.FOUL
	return Result.WHIFF


func _within(aim: float, timing: float, aim_ratio: float, window: float, config: BalanceConfig) -> bool:
	return aim <= config.aim_radius * aim_ratio and timing <= window
