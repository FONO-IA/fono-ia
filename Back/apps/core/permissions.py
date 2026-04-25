from rest_framework import permissions


class IsPaciente(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.groups.filter(name='Paciente').exists())

    def has_object_permission(self, request, view, obj):
        # Verificar se o paciente está acessando seus próprios dados
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsFonoaudiologo(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.groups.filter(name='Fonoaudiologo').exists())

    def has_object_permission(self, request, view, obj):
        # Verificações adicionais para fonoaudiologo
        return True  # Ou lógica mais específica


class IsPacienteOrFonoaudiologo(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                (request.user.groups.filter(name='Paciente').exists() or
                 request.user.groups.filter(name='Fonoaudiologo').exists()))
