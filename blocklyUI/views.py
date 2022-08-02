from django.shortcuts import render

# Create your views here.
from django.conf import settings
from django.template import loader
from django.http import Http404

from django.http import HttpResponse

from django.http import HttpResponseBadRequest, JsonResponse

import json
from rdflib import BNode, RDF
from transformation_algebra import \
    TransformationGraph, TransformationQuery, TA
from transformation_algebra.type import Product, Top, TypeOperation
from transformation_algebra.util.store import TransformationStore
from cct.language import cct, R3
from geo_question_parser import QuestionParser
from geo_question_parser import TypesToQueryConverter

wf_store = TransformationStore(
    url=settings.TDB_URL,
    user=settings.TDB_USER,
    password=settings.TDB_PASS
)

# [SC] for testing
# from django.apps import apps


def question2query(q: dict) -> TransformationQuery:
    """
    Converts a dictionary returned by Haiqi's natural language parser into a
    `TransformationGraph`, which can be in turn translated to a SPARQL query.
    """
    # This should probably go in a more sane place eventually, when the
    # structure of the modules is more stable
    base = q['cctrans']

    g = TransformationGraph(cct)
    task = BNode()
    types = {}
    for x in base['types']:
        types[x['id']] = x
        x['node'] = node = BNode()
        t = cct.parse_type(x['cct']).concretize(Top)
        if isinstance(t, TypeOperation) and t.params[0].operator == Product:
            assert isinstance(t.params[0], TypeOperation)
            t = R3(t.params[0].params[0], t.params[1], t.params[0].params[1])
        g.add((node, TA.type, cct.uri(t)))

    for edge in base['transformations']:
        for before in edge['before']:
            for after in edge['after']:
                b = types[before]['node']
                a = types[after]['node']
                g.add((b, TA["from"], a))

    g.add((task, RDF.type, TA.Task))
    g.add((task, TA.output, types['0']['node']))
    return TransformationQuery(cct, g)


def parseQuestion(qStr):
    parser = QuestionParser(None)
    qParsed = parser.parseQuestion(qStr)
    
    cctAnnotator = TypesToQueryConverter()
    cctAnnotator.algebraToQuery(qParsed, True, True)
    cctAnnotator.algebraToExpandedQuery(qParsed, False, False)
    
    # [SC] the query json object is inside qParsed variable
    # [SC] you can send the marklogic query from here
    # [SC] also attach the JSON-LD workflow to qParsed

    query = question2query(qParsed)

    qParsed['matches'] = [str(wf) for wf in query.run(wf_store)]

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
