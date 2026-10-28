class ProcessingError(Exception):
    def __init__(self, message, step):
        super().__init__(message)
        self.step = step