/**
 * @jest-environment jsdom
 */

import { getByTestId, screen, waitFor } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
jest.mock("../app/Store", () => mockStore)
window.alert = jest.fn()



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    //Test de l'icone de mail mis en évidence
    test("Then mail icone should be hilghlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.classList.contains("active-icon")).toBeTruthy();
    });
  })

    //Test du format des images acceptés
    describe('When I put a png file', () => { 
    test("Then png file should be accepted", ()=>{
      const jsdomAlert = window.alert;
      window.alert = ()=>{}
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a.com" }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname)=>{document.body.innerHTML= pathname}
      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId('file')
      const file = new File(["file.png"], "file.png", { type: "image/png" })

      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {target: {files: [file]}})
      
      jest.spyOn(window, "alert").mockImplementation(() => { })

      expect(window.alert).not.toHaveBeenCalled()
      window.alert = jsdomAlert
    })
  })
    describe("When I try to put wrong file format", ()=>{
    test("Then pdf file should be denied", ()=>{
      // const jsdomAlert = window.alert;
      // window.alert = ()=>{}
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Object.defineProperty(window, "alert",()=>{})
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a.com" }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname)=>{document.body.innerHTML= pathname}
      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId('file')
      expect(inputFile).toBeTruthy()
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, { target: { files: [new File(["file.zip"], "file.zip", { type: "file/zip" })] } })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0].name).not.toBe("file.jpg")
      jest.spyOn(window, "alert").mockImplementation(() => { })
      expect(window.alert).toHaveBeenCalled()
      // window.alert = jsdomAlert
    })
  })



  //Test POST
  describe("'When I want to create a newbill", () => {
    test("Then the bill is created", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a" }))

        //Simuler un nouveau formulaire
      const email = "a@a"
        const billPaper = {
          email,
          type : 'Transports',
          name : 'Test post',
          amount : 150,
          date : "02/06/2023",
          vat : 70,
          pct : 20,
          commentary : "Test post commentary",
          fileURL : "test/post",
          fileName : "test.png",
          status : 'pending'
        }
        const newBill = new NewBill({document, onNavigate, store: null , localStorage :window.localStorage})

        //Je push les différents billPaper pour chaque case du formulaire 
        screen.getByTestId("expense-type").value = billPaper.type
        screen.getByTestId("expense-name").value = billPaper.name
        screen.getByTestId("amount").value = billPaper.amount
        screen.getByTestId("datepicker").value = billPaper.date
        screen.getByTestId("vat").value = billPaper.vat
        screen.getByTestId("pct").value = billPaper.pct
        screen.getByTestId("commentary").value = billPaper.commentary
        newBill.fileUrl = billPaper.fileURL
        newBill.fileName = billPaper.fileName
        newBill.status = billPaper.status
        console.log(test);
        console.log(billPaper.type);

        //Récupération des fonctions handleSubmit et updateBill
        const handleSubmit = jest.fn((e)=> newBill.handleSubmit(e))
        newBill.updateBill = jest.fn()
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)


        //Je vérifie que la fonction appelle bien le updateBill et handleSubmit
        expect(handleSubmit).toHaveBeenCalled()
        expect(newBill.updateBill).toHaveBeenCalled()

      })
  })


});


