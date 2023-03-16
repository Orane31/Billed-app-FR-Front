/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {

  describe('When I am on NewBill page and submit a valid form', () => {
    test('Then a new bill should be created in the API', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })

    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
      })
    )
			// Init the UI
      document.body.innerHTML = NewBillUI()

			// Create an object with the values to add in the BDD
      const earlyBillInfos = {
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        email: "a@a",
      }

			// Get the bills method in the mock
      const mockedBills = mockStore.bills()

			// Mock the update and create methods
      const spyCreate = jest.spyOn(mockedBills, 'create')
      const spyUpdate = jest.spyOn(mockedBills, "update")

			// Call the create method with the values to add
      const billCreated = await spyCreate(earlyBillInfos)

			// Check if the method have been called
      expect(spyCreate).toHaveBeenCalled()

			// Check the returned values by the create method
      expect(billCreated.key).toBe('1234')
      expect(billCreated.fileUrl).toBe("https://localhost:3456/images/test.jpg")

			// Create an object with the values to add in the BDD
      const completeBillInfos = {
        vat: "80",
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20
      }

			// Call the update method with the values to add
      const billUpdated = await spyUpdate(completeBillInfos)

			// Check the returned values by the update method
      expect(billUpdated.id).toBe("47qAXb6fIm2zOKkLzMro")
      expect(billUpdated.fileUrl).toBe("https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a")
      expect(billUpdated.fileName).toBe("preview-facture-free-201801-pdf-1.jpg")
    })
  })

  describe("When I am on NewBill Page", () => {
    // test("Then new bill form should be", () => {
    //   const html = NewBillUI()
    //   document.body.innerHTML = html
    //   //to-do write assertion

    // })
    test("Then mail icon in vertical layout should be highlighted", async() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getAllByTestId('icon-mail')[0])
      const windowIcon = screen.getAllByTestId('icon-mail')[0]
      const iconActivated = windowIcon.classList.contains('active-icon')
      expect(iconActivated).toBeTruthy()
  })

  })

  describe("When I select an image in a correct format", () => {
    // si on ajoute le dernier expect : ajouter async
    test("Then the input file should display the file name", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        // TODO dans store : function qui retourne bills
        const createBill = jest.spyOn(mockStore.bills(), "create");
        const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
        const input = screen.getByTestId('file');
        const newFile = new File(['image.png'], 'image.png', {
            type: 'image/png'
        })
        input.addEventListener('change', handleChangeFile);
        //fichier au bon format
        // fireEvent.change(input, new File(['image.png'], 'image.png', { type: 'image/png'}))
        fireEvent.change(input, {
            target: {
                files: [newFile]
            }
        })

        expect(handleChangeFile).toHaveBeenCalled()
        expect(createBill).toHaveBeenCalled();
        expect(input.files[0]).toEqual(newFile)
        // await waitFor(() => expect(newFile.fileName).toBe("image.png"));
    })

    test("Then a bill is created", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
        const handleSubmit = jest.fn(() => newBill.handleSubmit)
        const submit = screen.getByTestId('form-new-bill');
        submit.addEventListener('submit', handleSubmit);
        fireEvent.submit(submit)
        expect(handleSubmit).toHaveBeenCalled();
    })
    
})

describe("When I click on the submit button", () => {
  test("Then posts bill with mock API POST", async () => {
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    const myForm = screen.getByTestId("form-new-bill");
    const createBill = jest.spyOn(mockStore.bills(), "create");

    fireEvent.submit(myForm);
    expect(createBill).toHaveBeenCalled();
  });

  test("Then posts bill with mock API POST and fails with error 404", async () => {
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    const myForm = screen.getByTestId("form-new-bill");
    jest
      .spyOn(mockStore.bills(), "update")
      .mockRejectedValueOnce(new Error("Error 404"));
    try {
      fireEvent.submit(myForm);
    } catch (error) {
      expect(error.message).toBe("Error 404");
    }
  });
  test("Then posts bill with mock API POST and fails with error 500", async () => {
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    const myForm = screen.getByTestId("form-new-bill");
    jest
      .spyOn(mockStore.bills(), "update")
      .mockRejectedValueOnce(new Error("Error 500"));
    try {
      fireEvent.submit(myForm);
    } catch (error) {
      expect(error.message).toBe("Error 500");
    }
  });
});

describe("When I select a file with an incorrect extension", () => {
  test("Then the bill is deleted", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const input = screen.getByTestId('file');
      input.addEventListener('change', handleChangeFile);
      //fichier au mauvais format
      fireEvent.change(input, {
          target: {
              files: [new File(['image.txt'], 'image.txt', {
                  type: 'image/txt'
              })],
          }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      // expect(input) to be 
  })
})


})
