from django.shortcuts import render

# Create your views here.

from django.template import loader
from django.http import Http404

from django.http import HttpResponse

from django.http import HttpResponseBadRequest, JsonResponse

import json
import urllib  # cf <https://realpython.com/urllib-request/>
from rdflib import Graph
from rdflib.plugins.stores.sparqlstore import SPARQLStore
from cct.language import question2query

from questionParser.models import QuestionParser
from questionParser.models import TypesToQueryConverter

# While you can pass authorization to the `SPARQLStore` object, this
# authorization is basic; DIGEST authorization is only handled for
# `SPARQLUpdateStore`. To work around this, we add a custom opener to the
# `urllib.request` module that SPARQLConnector is using under the hood. It
# seems we could also pull the external dependency of SPARQLWrapper, as
# mentioned in <https://github.com/RDFLib/rdflib/issues/343>, but RDFLib
# dropped this dependency in <https://github.com/RDFLib/rdflib/pull/744>, so
# I'd rather not re-import it (but see also
# <https://github.com/RDFLib/sparqlwrapper/pull/126>). Note also that there was
# a QuAnGIS-MarkLogic client at <https://github.com/quangis/marklogic_client>,
# but I'd rather not roll my own for this sort of thing (plus: we do have to
# inferface with `rdflib`).
passmgr = urllib.request.HTTPPasswordMgrWithDefaultRealm()
passmgr.add_password(
    None, "https://qanda.soliscom.uu.nl:8000/v1/graphs/sparql",
    "username", "password")
auth_handler = urllib.request.HTTPDigestAuthHandler(passmgr)
opener = urllib.request.build_opener(auth_handler)
urllib.request.install_opener(opener)
store = SPARQLStore("https://qanda.soliscom.uu.nl:8000/v1/graphs/sparql")
graph = Graph(store)

# [SC] for testing
# from django.apps import apps


def parseQuestion(qStr):
    parser = QuestionParser(None)
    qParsed = parser.parseQuestion(qStr)
    
    cctAnnotator = TypesToQueryConverter()
    cctAnnotator.algebraToQuery(qParsed, True, True)
    cctAnnotator.algebraToExpandedQuery(qParsed, False, False)
    
    # [SC] the query json object is inside qParsed variable
    # [SC] you can send the marklogic query from here
    # [SC] also attach the JSON-LD workflow to qParsed

    qParsed['matches'] = [str(wf) for wf in question2query(qParsed).run(graph)]

    return qParsed
    

def loadBlocklyUI(request):
    print("========================= request from " + get_client_ip(request))
    
    context = {}
    return render(request, 'blocklyUI/index.html', context)


# [SC][TODO] remove the function    
def processNlpQuestion(request):
    print("========================= request from " + get_client_ip(request))
    
    qStr = request.GET['qStr']
    qParsed = parseQuestion(qStr)

    return HttpResponse(json.dumps(qParsed) + "<br><br><a href='/'>Go back</a>")
    
    # [SC][DELETE] for testing
    #return HttpResponse("Received and sent back this question: %s." % request.GET['qStr']) # [SC][DELETE]

    
def processNlpQuestionAsync(request):
    print("========================= request from " + get_client_ip(request))

    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if is_ajax:
        if request.method == 'GET':
            qStr = request.GET.get('qStr', '')
            qParsed = parseQuestion(qStr)
            
            return JsonResponse(qParsed) # [SC][TODO] remove the array form in the output of parse_Question
        return JsonResponse({'status': 'Invalid request'}, status=400)
    else:
        return HttpResponseBadRequest('Invalid request')
    
    # [SC][DELETE] for testing
    #myModel = apps.get_model('questionParser', 'parseQuestion')
    #return HttpResponse("Received and sent back this question: %s." % request.GET['qStr']) # [SC][DELETE]
        

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
