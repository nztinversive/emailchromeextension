from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from langchain import PromptTemplate
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
import os


my_secret = os.environ['OPENAI_API_KEY']

app = Flask(__name__)
CORS(app)  # This line enables CORS for your app

template = """
    Below is an email that may be poorly worded.
    Your goal is to:
    - Properly format the email
    - Convert the input text to a specified tone
    - Convert the input text to a specified dialect

    Here are some examples different Tones:
    - Formal: We went to Barcelona for the weekend. We have a lot of things to tell you.
    - Informal: Went to Barcelona for the weekend. Lots to tell you.  

    Here are some examples of words in different dialects:
    - American: French Fries, cotton candy, apartment, garbage, cookie, green thumb, parking lot, pants, windshield
    - British: chips, candyfloss, flag, rubbish, biscuit, green fingers, car park, trousers, windscreen

    Example Sentences from each dialect:
    - American: I headed straight for the produce section to grab some fresh vegetables, like bell peppers and zucchini. After that, I made my way to the meat department to pick up some chicken breasts.
    - British: Well, I popped down to the local shop just the other day to pick up a few bits and bobs. As I was perusing the aisles, I noticed that they were fresh out of biscuits, which was a bit of a disappointment, as I do love a good cuppa with a biscuit or two.

    Please start the email with a warm introduction. Add the introduction if you need to.
    
    Below is the email, tone, and dialect:
    TONE: {tone}
    DIALECT: {dialect}
    EMAIL: {email}
    
    YOUR {dialect} RESPONSE:

"""

reply_template = """
    Below is an email that may be poorly worded.
    Your goal is to:
    - Properly format the email
    - Convert the input text to a specified tone
    - Convert the input text to a specified dialect
    - Reply to the given email


        Here are some examples different Tones:
    - Formal: We went to Barcelona for the weekend. We have a lot of things to tell you.
    - Informal: Went to Barcelona for the weekend. Lots to tell you.  

    Here are some examples of words in different dialects:
    - American: French Fries, cotton candy, apartment, garbage, cookie, green thumb, parking lot, pants, windshield
    - British: chips, candyfloss, flag, rubbish, biscuit, green fingers, car park, trousers, windscreen

    Example Sentences from each dialect:
    - American: I headed straight for the produce section to grab some fresh vegetables, like bell peppers and zucchini. After that, I made my way to the meat department to pick up some chicken breasts.
    - British: Well, I popped down to the local shop just the other day to pick up a few bits and bobs. As I was perusing the aisles, I noticed that they were fresh out of biscuits, which was a bit of a disappointment, as I do love a good cuppa with a biscuit or two.

    Please start the email with a warm introduction. Add the introduction if you need to.
    
    Below is the email, tone, and dialect:
    TONE: {tone}
    DIALECT: {dialect}
    EMAIL: {email}
    
    YOUR {dialect} RESPONSE:
"""

prompt = PromptTemplate(
    input_variables=["tone", "dialect","email"],
    template=template,
)

reply_prompt = PromptTemplate(
    input_variables=["tone", "dialect","email"],
    template=reply_template,
)

def load_LLM(openai_api_key):
    llm = OpenAI(temperature=.7, openai_api_key=openai_api_key, model_name='gpt-3.5-turbo')
    return llm

@app.route('/generate_emails', methods=['POST'])
@cross_origin()  # Add this line to resolve the CORS error
def generate_emails():
    data = request.get_json()
    email_subject = data.get('email_subject', '')
    option_tone = data.get('tone', 'Formal')
    option_dialect = data.get('dialect', 'American')
    option_action = data.get('action', 'New Email')
    option_action = data.get('action', 'Reply')
    openai_api_key = data.get('openai_api_key', '')

    llm = load_LLM(openai_api_key=my_secret)

    if option_action == 'New Email':
        prompt_with_email = prompt.format(tone=option_tone, dialect=option_dialect, email=email_subject)
    elif option_action == 'Reply':
        prompt_with_email = reply_prompt.format(tone=option_tone, dialect=option_dialect, email=email_subject)
    formatted_email = llm(prompt_with_email)
    
    return jsonify({"formatted_email": formatted_email})


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)