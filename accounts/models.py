# accounts.models.py

from django.db import models
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser
)


class Branch(models.Model):
    name = models.CharField(max_length=120)
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = 'Branch'
        verbose_name_plural = 'Branches'

class IntranetURL(models.Model):
    url = models.CharField(max_length=120)
    def __str__(self):
        return self.url
    class Meta:
        verbose_name = 'Intranet URL'
        verbose_name_plural = 'Intranet URLs'

class UserManager(BaseUserManager):
    def create_user(self, username, branch, password=None):
        # if not email:
        #     raise ValueError('Users must have an email address')
        user = self.model(
            username=username,
            branch=Branch.objects.get(id = branch),
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_staffuser(self, username, branch, password):
        user = self.create_user(
            username=username,
            branch=branch,
            password=password,
        )
        user.staff = True
        user.save(using=self._db)
        return user

    def create_superuser(self, password, branch, username):
        user = self.create_user(
            username=username,
            branch=branch,
            password=password,
        )
        user.staff = True
        user.admin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

calendarOptions = [('spaces','Spaces'),('calendar', 'Calendar')]

class User(AbstractBaseUser):
    username=models.CharField(max_length=25, unique=True)
    active = models.BooleanField(default=True)
    staff = models.BooleanField(default=False) # a admin user; non super-user
    admin = models.BooleanField(default=False) # a superuser
    branch = models.ForeignKey(Branch, related_name = 'accounts', blank=True, null=True)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    is_superuser = models.BooleanField(default=False)

    startup_page = models.ForeignKey(IntranetURL, related_name = 'accounts', default='1')
    calendar_preference = models.CharField(max_length=60, choices=calendarOptions, default='calendar')
    calendar_condensed_view = models.BooleanField(default=False)
    tileview = models.BooleanField(default=False)


    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        # unique=True,
    )
    # notice the absence of a "Password field", that's built in.

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['branch'] # Email & Password are required by default.


    objects = UserManager()

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        return self.staff

    @property
    def is_admin(self):
        "Is the user a admin member?"
        return self.admin

    @property
    def is_active(self):
        "Is the user active?"
        return self.active
