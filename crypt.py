import bcrypt


class Bcrypt(object):
    def get_hashed_password(plain_text_password):
        return bcrypt.hashpw(plain_text_password.encode(), bcrypt.gensalt())

    def check_password(plain_text_password, hashed_password):
        return bcrypt.checkpw(plain_text_password.encode(), hashed_password)
