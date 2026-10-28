class_name BatterView
extends Node2D
## Batting view: ball flight, aim circle, swing input, result text.
## Implements design/game-brief.md MVP 2 (story-001-mouse-aim-batting).
## Judgement lives in SwingJudge; this node only presents and reports.

## Emitted once per pitch with the final result (SwingJudge.Result value).
signal swing_resolved(result: int, aim_error: float, timing_error: float)

enum State { PITCHING, RESULT }

const DEFAULT_CONFIG_PATH: String = "res://assets/data/balance_default.tres"
const RESULT_TEXT: Dictionary = {
	SwingJudge.Result.WHIFF: "헛스윙",
	SwingJudge.Result.FOUL: "파울",
	SwingJudge.Result.GROUNDOUT: "땅볼 아웃",
	SwingJudge.Result.FLYOUT: "뜬공 아웃",
	SwingJudge.Result.SINGLE: "안타",
	SwingJudge.Result.DOUBLE: "2루타",
	SwingJudge.Result.HOME_RUN: "홈런",
	SwingJudge.Result.NO_SWING: "노스윙",
}

@export var config: BalanceConfig

var _judge: SwingJudge = SwingJudge.new()
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()
var _label: Label
var _state: State = State.PITCHING
var _elapsed: float = 0.0
## Pitch start in microseconds; swing timing is measured from this, not from
## frame-quantized _elapsed.
var _pitch_start_usec: int = 0
var _result_timer: float = 0.0
var _swung: bool = false
var _arrival: Vector2 = Vector2.ZERO
var _aim_position: Vector2 = Vector2.ZERO


func _ready() -> void:
	if config == null:
		config = load(DEFAULT_CONFIG_PATH) as BalanceConfig
	_rng.randomize()
	_aim_position = config.strike_zone_center
	_label = Label.new()
	_label.position = Vector2(config.strike_zone_center.x - 100.0, 40.0)
	_label.add_theme_font_size_override("font_size", 32)
	add_child(_label)
	_start_pitch()


func _process(delta: float) -> void:
	if _state == State.PITCHING:
		_elapsed += delta
		if _elapsed > config.ball_travel_seconds + config.late_swing_grace_seconds:
			_resolve(SwingJudge.Result.NO_SWING, 0.0, 0.0)
	else:
		_result_timer -= delta
		if _result_timer <= 0.0:
			_start_pitch()
	queue_redraw()


func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		var motion: InputEventMouseMotion = event as InputEventMouseMotion
		if motion.device != InputEvent.DEVICE_ID_EMULATION:
			_aim_position = (make_input_local(motion) as InputEventMouseMotion).position
	elif event is InputEventScreenDrag:
		var drag: InputEventScreenDrag = event as InputEventScreenDrag
		_aim_position = (make_input_local(drag) as InputEventScreenDrag).position
	elif event is InputEventMouseButton:
		var button: InputEventMouseButton = event as InputEventMouseButton
		# Emulated mouse events from touch are skipped; touch is handled below.
		if button.device != InputEvent.DEVICE_ID_EMULATION \
				and button.button_index == MOUSE_BUTTON_LEFT and button.pressed:
			_aim_position = (make_input_local(button) as InputEventMouseButton).position
			_try_swing()
	elif event is InputEventScreenTouch:
		var touch: InputEventScreenTouch = event as InputEventScreenTouch
		if touch.pressed:
			_aim_position = (make_input_local(touch) as InputEventScreenTouch).position
			_try_swing()


func _draw() -> void:
	var half: Vector2 = config.strike_zone_size * 0.5
	var zone: Rect2 = Rect2(config.strike_zone_center - half, config.strike_zone_size)
	draw_rect(zone, Color(1, 1, 1, 0.8), false, 3.0)
	if _state == State.PITCHING:
		var progress: float = clampf(_elapsed / config.ball_travel_seconds, 0.0, 1.0)
		var pos: Vector2 = config.pitcher_position.lerp(_arrival, progress)
		var ball_scale: float = lerpf(config.ball_scale_start, config.ball_scale_end, progress)
		draw_circle(pos, config.ball_base_radius * ball_scale, Color.WHITE)
	draw_arc(_aim_position, config.aim_radius, 0.0, TAU, 48, Color(1.0, 0.85, 0.2), 3.0)


func _start_pitch() -> void:
	_state = State.PITCHING
	_elapsed = 0.0
	_pitch_start_usec = Time.get_ticks_usec()
	_swung = false
	_label.text = ""
	var half: Vector2 = config.strike_zone_size * 0.5
	_arrival = config.strike_zone_center + Vector2(
			_rng.randf_range(-half.x, half.x), _rng.randf_range(-half.y, half.y))


func _try_swing() -> void:
	if _state != State.PITCHING or _swung:
		return
	_swung = true
	var aim_error: float = _aim_position.distance_to(_arrival)
	var swing_elapsed: float = float(Time.get_ticks_usec() - _pitch_start_usec) / 1000000.0
	var timing_error: float = swing_elapsed - config.ball_travel_seconds
	_resolve(_judge.judge(aim_error, timing_error, config), aim_error, timing_error)


func _resolve(result: SwingJudge.Result, aim_error: float, timing_error: float) -> void:
	_state = State.RESULT
	_result_timer = config.result_display_seconds + config.pitch_interval_seconds
	_label.text = RESULT_TEXT[result]
	swing_resolved.emit(result, aim_error, timing_error)
