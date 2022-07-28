from django.urls import include, path

from django.conf import settings
from django.conf.urls.static import static

from . import views

app_name = 'blocklyUINS' # [SC] URL namespace

# [SC] URL patterns for the blocklyUI app
urlpatterns = [
    path(route='', view=views.loadBlocklyUI, name='urln_blocklyUI'),
    path(route='parsedQ/', view=views.processNlpQuestion, name='urln_parsedQ'),
    path(route='parsedQAsync/', view=views.processNlpQuestionAsync, name='urln_parsedQAsync'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # [SC][TODO] not sure what this for
