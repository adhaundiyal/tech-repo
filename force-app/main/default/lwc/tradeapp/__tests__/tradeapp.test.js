import { createElement } from 'lwc';
import Tradeapp from 'c/tradeapp';
import getBookedTrades from '@salesforce/apex/TradeController.getBookedTrades';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

// Realistic data with a list of contacts
const mockFindTrades = require('./data/findTrades.json');
const mockGetSellCCYPicklistValues = require('./data/getSellCCYPicklistValues.json');

// Mock Apex wire adapter
jest.mock(
    '@salesforce/apex/TradeController.getBookedTrades',
    () => {
        const {
            createApexTestWireAdapter
        } = require('@salesforce/sfdx-lwc-jest');
        return {
            default: createApexTestWireAdapter(jest.fn())
        };
    },
    { virtual: true }
);

describe('c-tradeapp', () => {

    beforeAll(() => {
        // We use fake timers as setTimeout is used in the JavaScript file.
        jest.useFakeTimers();
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();

    });

    // Helper function to wait until the microtask queue is empty. This is needed for promise
    // timing when calling imperative Apex.
    async function flushPromises() {
        return Promise.resolve();
    }

    describe('getBookedTrades @wire data', () => {
        it('gets called with page size and page number', async () => {
            const PAGE_SIZE = 1;
            const PAGE_NUMBER = 1;
            const WIRE_PARAMETER = { pageSize: PAGE_SIZE, pageNumber: PAGE_NUMBER };

            // Create initial element
            const element = createElement('c-tradeapp', {
                is: Tradeapp
            });
            document.body.appendChild(element);

            // Run all fake timers.
            jest.runAllTimers();

            // Wait for any asynchronous DOM updates
            await flushPromises();

            // Validate parameters of @wire
            expect(getBookedTrades.getLastConfig()).toEqual(WIRE_PARAMETER);
        });

        it('renders data of one record', async () => {
            //const PAGE_SIZE = 1;
            //const PAGE_NUMBER = 1;

            // Create initial element
            const element = createElement('c-tradeapp', {
                is: Tradeapp
            });
            document.body.appendChild(element);

            // Run all fake timers.
            jest.runAllTimers();

            // Emit data from @wire
            getBookedTrades.emit(mockFindTrades.toString());

            // Wait for any asynchronous DOM updates
            await flushPromises();

            // Select elements for validation
            const detailEls = element.shadowRoot.querySelectorAll('p');
            expect(detailEls.length).toBe(mockFindTrades.length);
            expect(detailEls[0].textContent).toBe(mockFindTrades[0].Name);
        });
    });

    describe('getPicklistValues @wire data', () => {
        it('renders three currency types', () => {
            // Create element
            const element = createElement('c-tradeapp', {
                is: Tradeapp
            });
            document.body.appendChild(element);

            // Emit data from @wire
            getPicklistValues.emit(mockGetSellCCYPicklistValues);

            // Return a promise to wait for any asynchronous DOM updates. Jest
            // will automatically wait for the Promise chain to complete before
            // ending the test and fail the test if the promise rejects.
            return Promise.resolve().then(() => {
                // Select elements for validation
                const checkboxEls =
                    //element.shadowRoot.querySelectorAll('lightning-input');
                    element.shadowRoot.querySelectorAll('lightning-combobox');
                expect(checkboxEls.length).toBe(
                    mockGetSellCCYPicklistValues.values.length
                );
            });
        });
    });

    describe('getObjectInfo @wire error', () => {
        it('shows error panel element', async () => {
            // Create initial element
            const element = createElement('c-tradeapp', {
                is: Tradeapp
            });
            document.body.appendChild(element);

            // Emit error from @wire
            getPicklistValues.error();

            // Wait for any asynchronous DOM updates
            await flushPromises();

            const errorPanelEl =
                element.shadowRoot.querySelector('c-error-panel');
            expect(errorPanelEl).not.toBeNull();
        });
    });

    it('is accessible when picklist values are returned', async () => {
        // Create element
        const element = createElement('c-tradeapp', {
            is: Tradeapp
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getPicklistValues.emit(mockGetSellCCYPicklistValues);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        await expect(element).toBeAccessible();
    });

    it('is accessible when error is returned', async () => {
        // Create element
        const element = createElement('c-tradeapp', {
            is: Tradeapp
        });
        document.body.appendChild(element);

        // Emit error from @wire
        getPicklistValues.error();

        // Wait for any asynchronous DOM updates
        await flushPromises();

        await expect(element).toBeAccessible();
    });
});