package constants

// Success messages
const (
	MsgLoginSuccess          = "Вход выполнен успешно"
	MsgLogoutSuccess         = "Выход выполнен успешно"
	MsgPasswordChanged       = "Пароль успешно изменен"
	MsgUserCreated           = "Пользователь успешно создан"
	MsgUserUpdated           = "Пользователь успешно обновлен"
	MsgUserDeleted           = "Пользователь успешно удален"
	MsgAvatarUploaded        = "Аватар успешно загружен"
	MsgAvatarDeleted         = "Аватар успешно удален"
)

// Error messages
const (
	ErrInvalidCredentials     = "Неверные учетные данные"
	ErrUnauthorized           = "Необходима авторизация"
	ErrAccessDenied           = "Нет доступа к этому ресурсу"
	ErrAccountBlocked         = "Ваш аккаунт заблокирован"
	ErrUserNotFound           = "Пользователь не найден"
	ErrUserAlreadyExists      = "Пользователь с таким логином уже существует"
	ErrInvalidUserID          = "Неверный ID пользователя"
	ErrCannotDeleteSelf       = "Вы не можете удалить самого себя"
	ErrPasswordChangeForbidden = "Смена пароля запрещена"
	ErrPasswordMismatch       = "Пароли не совпадают"
	ErrWeakPassword           = "Пароль не соответствует требованиям безопасности"
	ErrInvalidEmail           = "Некорректный email адрес"
	ErrInvalidPhone           = "Некорректный номер телефона"
	ErrInvalidInput           = "Неверный формат данных"
	ErrInternalServer         = "Внутренняя ошибка сервера"
	ErrDatabaseError          = "Ошибка при работе с базой данных"
	ErrTooManyRequests        = "Слишком много запросов. Пожалуйста, попробуйте позже"
	ErrInvalidFileType        = "Недопустимый тип файла"
	ErrFileTooLarge           = "Файл слишком большой"
)

// Audit log messages
const (
	AuditUserCreated       = "AUDIT: User %d (%s) created user %d (%s) with role %s"
	AuditUserUpdated       = "AUDIT: User %d (%s) updated user %d"
	AuditUserDeleted       = "AUDIT: User %d (%s) deleted user %d"
	AuditPasswordChanged   = "AUDIT: User %d (%s) changed their password"
	AuditAvatarUploaded    = "AUDIT: User %d uploaded avatar"
	AuditAvatarDeleted     = "AUDIT: User %d deleted avatar"
	AuditLoginSuccess      = "Login successful for user: %s (ID: %d)"
	AuditLoginFailed       = "Login attempt failed for user: %s"
	AuditUserBlocked       = "Blocked user login attempt: %s"
)

// Validation messages
const (
	ValidationPasswordMinLength       = "Пароль должен содержать минимум 8 символов"
	ValidationPasswordMaxLength       = "Пароль не должен превышать 128 символов"
	ValidationPasswordRequireUppercase = "Пароль должен содержать хотя бы одну заглавную букву"
	ValidationPasswordRequireLowercase = "Пароль должен содержать хотя бы одну строчную букву"
	ValidationPasswordRequireDigit     = "Пароль должен содержать хотя бы одну цифру"
	ValidationPasswordRequireSpecial   = "Пароль должен содержать хотя бы один специальный символ"
	ValidationUsernameMinLength       = "Логин должен содержать минимум 3 символа"
	ValidationUsernameMaxLength       = "Логин не должен превышать 50 символов"
	ValidationUsernameInvalidChars    = "Логин может содержать только латинские буквы, цифры, точки, дефисы и подчеркивания"
)

// System constants
const (
	DefaultPageSize = 20
	MaxPageSize     = 100
	JWTExpiration   = 24 // hours
)
