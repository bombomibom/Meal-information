// 모듈
const express = require("express"); // 서버 모듈
const request = require("request"); // html 가져오기
const cheerio = require("cheerio"); // html 데이터 추출
const Excel = require("exceljs"); // 데이터 excel 추출
const bodyParser = require('body-parser');
const { response } = require("express");
//const iconv = require("iconv-lite"); // 인코딩 euc-kr -> utf-8 바꿔주는 모듈 --> 나중에 시도(에러!)

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.listen(80);
console.log("serverOk");

// main.html
app.get('/', function(req, res){
    res.sendfile("./front/main.html");
})

// 1. list 전달
app.get('/getList', function(req, res){
    // cheerio html 추출
    request(
        {
            url: "https://www.kopo.ac.kr/kangseo/content.do?menu=262",
            method: "GET"
        },
        (error, response, body) => {
            if (error) {
                console.error(error);
                return;
                // https://news.naver.com1212121212121212/ 에러 발생 url로 변경 후 테스트 진행
            }
            if (response.statusCode === 200) {
                //console.log("response ok");
                //console.log(body);

                // 아래 두 문장은 icov 모듈 설치되면 진행
                // const bodyDecoded = iconv.decode(body, "euc-kr");
                // console.log(bodyDecoded);

                // cheerio를 활용하여 body에서 데이터 추출
                const $ = cheerio.load(body);
                const tbl_table_arr = $(".tbl_table>tbody>tr").toArray();
                // console.log(tbl_table_arr.length);
                const result = [];
                
                tbl_table_arr.forEach((tr) => {
                    // result에 1. 날짜 / 2. 중식 저장
                    const tdFirst = $(tr).find("td").first();
                    const day = (tdFirst.text().trim()).split(';')[1];
                    //console.log(day);
                    const tdThird = $(tr).find("td").eq(2);
                    const menu = (tdThird.text().trim()).split('\n, ');
                    //console.log(menu);

                    result.push({
                        day,
                        menu
                    });
                })
                console.log(result);
                res.send(result);
            }
        }
    )
})

// 2. 엑셀 다운로드
app.post('/drawExcel', function(req, res){
    
    // 2.1. 사전 엑셀 시트 세팅
    const workbook = new Excel.Workbook();
    workbook.creator = '김보미';
    workbook.lastModifiedBy = '김보미';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    const workSheet = workbook.addWorksheet('Sheet One');
    workSheet.columns = [
        {key: 'mon'},
        //{key: 'monMenuScore'},
        {key: 'tus'},
        //{key: 'tusMenuScore'},
        {key: 'wed'},
        //{key: 'wedMenuScore'},
        {key: 'thr'},
        //{key: 'thrMenuScore'},
        {key: 'fri'},
        //{key: 'friMenuScore'}
    ]

    

    // 2.2. 식단표 및 평균 데이터 세팅
    
    const finalList = [];
    console.log(req.body.excelData);
    const dayAndMenuList = req.body.excelData;
    //console.log(dayAndMenuList);
    //console.log(workSheet.columns[0].key);
    

    const exam22 = [];
    
    // finalList[0] = { keyNm[0] : dayAndMenuList[0][0], keyNm[1] : dayAndMenuList[1][0], keyNm[2] : dayAndMenuList[2][0], keyNm[3] : dayAndMenuList[3][0] }
    // finalList[1] = { keyNm[0] : dayAndMenuList[0][1], keyNm[1] : dayAndMenuList[1][1], keyNm[2] : dayAndMenuList[2][1], keyNm[3] : dayAndMenuList[3][1] }
    // finalList[2] = { keyNm[0] : dayAndMenuList[0][2], keyNm[1] : dayAndMenuList[1][2], keyNm[2] : dayAndMenuList[2][2], keyNm[3] : dayAndMenuList[3][2] }

    var maxLen = 0;
    for(let i = 0; i < dayAndMenuList.length; i++){
        //console.log(dayAndMenuList[i].length);
        var listLen = dayAndMenuList[i].length;
        var keyNm = workSheet.columns[i].key;
        
        if(maxLen < listLen){
            maxLen = listLen;
        }
        //console.log(maxLen);
        for(let j = 0; j < maxLen; j++){
            finalList[i].push({keyNm : dayAndMenuList[i][j]});
        }
    }

    const exampleVer1 = [
        ['대체공휴일', 0, '백미밥', 2, '크림스', 0, '백미밥', 1, '백미밥', 1],
        ['', '','미역국', 2, '양송이', 2, '육개장', 1, '부대찌', 1],
        ['', '', '닭갈비', 2, '빵&잼', 2, '바싹불', 1, '코다리', 1],
        ['', '', '숯불바베큐바', 2, '케이준', 2, '계란장', 1, '두부조림', 1],
        ['', '', '콩나물무침', 2, '피클', 2, '시금치', 1, '오이지', 1],
        ['', '', '김치', 2, '추가밥', 2, '김치', 1, '', ''],
        ['평균', '', '평균', 2, '평균', 2, '평균', 1, '평균', '']
    ]
    
    //for(let i = 0; i < req.body.dataList)

    for(let i = 0; i < exampleVer1.length; i++){

        //console.log(exampleVer1[i]); 
        var zero = exampleVer1[i].length - exampleVer1[i].length;

        finalList[i] = { mon : exampleVer1[i][zero], monMenuScore : exampleVer1[i][zero+1], tus : exampleVer1[i][zero+2], tusMenuScore : exampleVer1[i][zero+3], wed : exampleVer1[i][zero+4], wedMenuScore : exampleVer1[i][zero+5], thr : exampleVer1[i][zero+6], thrMenuScore : exampleVer1[i][zero+7], fri : exampleVer1[i][zero+8], friMenuScore : exampleVer1[i][zero+9]};

    }

    //console.log(finalList);


    // const example = [
    //     { mon : '월',        monMenuScore: '', tus: '화',           tusMenuScore: '', wed: '수',   wedMenuScore: '', thr: '목',    thrMenuScore: '', fri: '금',      friMenuScore: ''},
    //     { mon : '대체공휴일', monMenuScore: '', tus: '백미밥',       tusMenuScore: 2, wed: '크림스', wedMenuScore: 0, thr: '백미밥', thrMenuScore: 1, fri: '백미밥',   friMenuScore: 2},
    //     { mon : '',          monMenuScore: '', tus: '미역국',       tusMenuScore: 2, wed: '양송이', wedMenuScore: 2, thr: '육개장', thrMenuScore: 1, fri: '부대찌',   friMenuScore: 1},
    //     { mon : '',          monMenuScore: '', tus: '닭갈비',       tusMenuScore: 2, wed: '빵&잼',  wedMenuScore: 5, thr: '바싹불', thrMenuScore: 1, fri: '코다리',   friMenuScore: 2},
    //     { mon : '',          monMenuScore: '', tus: '숯불바베큐바', tusMenuScore: 2, wed: '케이준',  wedMenuScore: 2, thr: '계란장', thrMenuScore: 1, fri: '두부조림', friMenuScore: 1},
    //     { mon : '',          monMenuScore: '', tus: '콩나물무침',   tusMenuScore: 2, wed: '피클',   wedMenuScore: 2, thr: '시금치',  thrMenuScore: 1, fri: '오이지',  friMenuScore: 3},
    //     { mon : '',          monMenuScore: '', tus: '김치',         tusMenuScore: 2, wed: '추가밥', wedMenuScore: 2, thr: '김치',   thrMenuScore: 1, fri: '',        friMenuScore: ''},
    //     { mon : '평균',      monMenuScore: '', tus: '평균',         tusMenuScore: 2, wed: '평균',   wedMenuScore: 3, thr: '평균',   thrMenuScore: 1, fri: '평균',     friMenuScore: 4},
    // ]
    
    
     //workSheet.insertRows(1, finalList);
     //workbook.xlsx.writeFile('example4.xlsx');

})