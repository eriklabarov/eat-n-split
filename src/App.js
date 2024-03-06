import { useEffect, useState } from "react"

function decodeHTMLEntities(encodedText) {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(
      encodedText,
      'text/html'
    ).body.textContent;
  
    return decodedString;
  }

  function disorderAnswers(arr) {
    const lastElement = arr[arr.length - 1];
    // Fisher-Yates shuffle algorithm
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  // Find the index of the last element before the disorder
  const indexBeforeDisorder = arr.findIndex((el) => lastElement === el);

  return indexBeforeDisorder;
  }



export default function App(){
    const [isStart, setIsStart] = useState(false)

function handleStart(){
    setIsStart(prev => !prev)
}
    return <div className="main">
    {!isStart?<HomePage handleStart={handleStart}/>:<QuestionList/>}
    </div>
}

function HomePage({handleStart}){
    return<div className="home-page">
        <h1>Quiz app</h1>
        <button onClick={handleStart}>Start Quiz</button>
    </div>
}
function Loader(){
    return <div className="loader"> loading...</div>
}
function ErrorMessage({error,hadnleRetry}){
    return <>
    <div className="loader">{error}</div>
    <button onClick={hadnleRetry}>Retry</button></>
}
function QuestionList(){
    const [questionsArray, setQuestionsArray] = useState([])
    const [checkAnswers, setCeckAnswers] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [retry, setRetry] = useState(false)
    const [isError, setError] = useState("")
    const [score, setScore] = useState("");

    
    useEffect(function(){
        async function fetchData(){
            try{
                setError("")
                setIsLoading(true)
                const res = await fetch('https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple')
            const data = await res.json()
            if(data.response_code !== 0) throw new Error('something went wrong');
            setQuestionsArray(data.results.map((item,index)=>{
                const answers = [...item.incorrect_answers,item.correct_answer]
                const indexOfCorrectAnswer = disorderAnswers(answers)
                let obj ={ question: decodeHTMLEntities(item.question),
                    answers: answers,
                    indexOfCorrectAnswer:indexOfCorrectAnswer
                }
                return obj;
            }));
            setIsLoading(false)
        }
        catch(err){
            console.log(err.message);
            setError(err.message)
        }
        }
        fetchData();
    },[retry])
    console.log(questionsArray);

    function hadnleRetry(){
        setCeckAnswers(false)
        setRetry(prev=>!prev)
    }

    function handleCheck(){
        setCeckAnswers(true)
    }

    return<div className="question-list">
        {isLoading && !isError ? <Loader/>:
         isError ? <ErrorMessage error={isError} hadnleRetry={hadnleRetry}/>
        :<>
       { questionsArray.map((item,i)=>
        <Question   
        key={i} 
        question={item.question} 
        answers={item.answers} 
        indexOfCorrectAnswer={item.indexOfCorrectAnswer} 
        checkAnswers={checkAnswers} />
        )}
        {score && <p>your score is {score}</p>}
        {!checkAnswers?<button onClick={handleCheck}>Check Answers</button>:<button onClick={hadnleRetry}>Retry</button>}
        </>
        
        }
    </div>
    
}

function Question({question,answers,indexOfCorrectAnswer,checkAnswers}){
    const [selectedAnswerId, setSelectedAnswerId] = useState(null);
    function handeleSelectAnswer (id){
        !checkAnswers && setSelectedAnswerId(id)
    }
    return<div className="question-bloc">
            <p className="question">{question}</p>
        <ul className="answers">
            {answers.map((answer, i)=>
            <Answer 
            id={i} 
            key={i} 
            handeleSelectAnswer={handeleSelectAnswer} 
            indexOfCorrectAnswer={indexOfCorrectAnswer} 
            selectedAnswerId={selectedAnswerId}
            checkAnswers={checkAnswers}>
                {decodeHTMLEntities(answer)}
            </Answer>
                )}
        </ul>  
    </div>
}
 
function Answer({children,handeleSelectAnswer, id, selectedAnswerId, indexOfCorrectAnswer, checkAnswers}){
    let answerStatut=""
    !checkAnswers? selectedAnswerId === id ? answerStatut="answer selected":answerStatut="answer" :
    indexOfCorrectAnswer  === id ? answerStatut="answer correct" :
    selectedAnswerId === id ? answerStatut="answer wrong" : answerStatut="answer"

    
    return  <li className={answerStatut} onClick={()=>handeleSelectAnswer(id)}>{children}</li>
    // <> 
    // {
    //     !checkAnswers? <li className={selectedAnswerId === id ? "answer selected":"answer"} onClick={()=>handeleSelectAnswer(id)}>{children}</li>:
    //   <> 
    //     {indexOfCorrectAnswer  === id ? <li className="answer correct" onClick={()=>handeleSelectAnswer(id)}>{children}</li>:
    //     selectedAnswerId === id ?   <li className="answer wrong" onClick={()=>handeleSelectAnswer(id)}>{children}</li>:
    //     <li className="answer" onClick={()=>handeleSelectAnswer(id)}>{children}</li>}
        
        
    //     </>
   
    // }</>
}