from django.urls import include, path

from django.conf import settings
from django.conf.urls.static import static

from . import views

app_name = 'blocklyUINS' # [SC] URL namespace

# [SC] URL patterns for the blocklyUI app
urlpatterns = [
    path(route='', view=views.loadBlocklyUI, name='urln_indexPage'),
    path(route='demo', view=views.loadDemo, name='urln_demoPage'),
    path(route='tutorials', view=views.loadTutorials, name='urln_tutorialsPage'),
    
    path(route='docs-tool', view=views.loadDocsTool, name='urln_docsToolPage'),
    path(route='docs-ccd', view=views.loadDocsCCD, name='urln_docsCcdPage'),
    path(route='docs-algebra', view=views.loadDocsAlgebra, name='urln_docsAlgebraPage'),
    
    path(route='about', view=views.loadAbout, name='urln_aboutPage'),
    
    # [SC] URL pattern to parse Blockly json output
    path(route='parsedBJAsync', view=views.processBlocklyJsonAsync, name='urln_blocklyJsonAsync'),
    
    path(route='retrievWfGraph', view=views.retrieveWfGraphAsync, name='urln_getWfGraphAsync'),
    path(route='retrievWfList', view=views.retrieveWfIdsAsync, name='urln_getWfListAsync'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # [SC][TODO] not sure what this for
