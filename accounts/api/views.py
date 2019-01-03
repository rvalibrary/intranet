from django.db.models import Q
# from django.contrib.auth import get_user_model


from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView


from rest_framework.generics import (
                    CreateAPIView,
                    DestroyAPIView,
                    ListAPIView,
                    RetrieveAPIView,
                    UpdateAPIView,
                    RetrieveUpdateAPIView,)

from rest_framework.filters import (
    SearchFilter,
    OrderingFilter,
)

from .pagination import RequestLimitOffsetPagination, RequestPageNumberPagination


from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)

from ..models import User, IntranetURL, Branch
# User = get_user_model()
# from ..models import Profile

from .serializers import (
      UserCreateSerializer,
      UserLoginSerializer,
      UserDetailSerializer,
      UserUpdateSerializer,
      IntranetURLSerializer,
      BranchListSerializer
      )

class BranchListView(ListAPIView):
    serializer_class = BranchListSerializer
    queryset = Branch.objects.all()

class IntranetURLListView(ListAPIView):
    serializer_class = IntranetURLSerializer
    queryset = IntranetURL.objects.all()

class UserCreateAPIView(CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]
    queryset = User.objects.all()

class UserDeleteAPIView(DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer


class UserLoginAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            new_data = serializer.data
            return Response(new_data, status=HTTP_200_OK)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

class UserUpdateAPIView(RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [AllowAny]
    def perform_update(self,serializer):
        serializer.save(user=self.request.user)

class UserListAPIView(ListAPIView):
    serializer_class = UserDetailSerializer
    permission_classes = [AllowAny]
    # queryset = User.objects.all()
    filter_backends = [SearchFilter]
    search_fields = ['username']
    #for more filter info, look into the e-commerce 2 project

    # pagination_class = RequestPageNumberPagination#PageNumberPagination

    def get_queryset(self, *args, **kwargs):
        queryset_list = User.objects.all()
        query = self.request.GET.get("q")
        if query:
            queryset_list = queryset_list.filter(
                Q(username__iexact=query)
            ).distinct()
        return queryset_list
