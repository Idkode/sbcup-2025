from datetime import datetime, timedelta
import pytz


def get_timestamp(seconds: int = 0, minutes: int = 0,
                  current: datetime = None) -> datetime:
    """Returns the timestamp of the current time plus
    0 or a specified number of seconds

    Author: https://github.com/Idkode

    Args:
        seconds (int, optional):
        The number of seconds until the required timestamp. Defaults to 0.

    Returns:
        datetime: The resulting timestamp
    """
    tz = pytz.timezone('America/Manaus')
    if not current:
        current = datetime.now(tz=tz)
    time_required = current + timedelta(seconds=seconds,
                                        minutes=minutes)
    return time_required


def get_start_time(multiple: int = 10) -> datetime:
    current_time = get_timestamp()
    minute = current_time.minute

    next_time = current_time + timedelta(minutes=(
        (multiple - minute % multiple)
        ))

    if multiple - minute % multiple < 1:
        next_time += timedelta(minutes=multiple)

    return next_time.replace(second=0, microsecond=0)


def get_interval(stamp: datetime) -> float:
    return (stamp - get_timestamp()).total_seconds()
