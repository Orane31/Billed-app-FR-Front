/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import NewBill from "../containers/NewBill.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()

    })
    test("Then bills should be ordered from latest to earliest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I am on bills page and I click on the eye icon", () => {
    test("Modal should open on the right", () => {
      const html = BillsUI({ data: bills});
      document.body.innerHTML = html;
      const modaleFile = document.getElementById("modaleFile");
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));
      const store = null;
      const billsList = new Bills({ document, onNavigate, store, localStorage: window.localStorage, });
      console.log(screen.getByTestId('tbody').getElementsByTagName('td')[0].textContent)
      const icon = screen.getAllByTestId('icon-eye')[0];
      const handleClickIconEye = jest.fn(() =>
          billsList.handleClickIconEye(icon)
      );
      icon.addEventListener('click', handleClickIconEye);
      fireEvent.click(icon);
      expect(handleClickIconEye).toHaveBeenCalled();
      expect(modaleFile).toBeTruthy();
    })
  })

  describe("When I click on 'Ajouter une note de frais'", () => {
    test("Then I should be sent to 'Envoyer une note de frais' page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const navigationButton = screen.getByTestId('btn-new-bill');
      const navigate = jest.fn(window.onNavigate(ROUTES_PATH.NewBill));
      navigationButton.addEventListener("click", navigate);
      fireEvent.click(navigationButton);
      expect(navigate).toHaveBeenCalled();
      
  })
  })


})
