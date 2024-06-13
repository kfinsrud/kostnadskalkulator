import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Page {
    title: string;
    ordering: number;
    subPages: string[];
    inputIds: string[];
}

export interface PagesState {
    pages: { id: number, page: Page }[];
    selected: number | undefined;
}

function updateOrdering(pagesWithID: { id: number, page: Page }[]) {
    pagesWithID.forEach(({id, page}, index) => {
        page.ordering = index;
    });
}



export const pageSlice = createSlice({
    name: 'pages',
    initialState: {
        pages: [],
        selected: undefined
    } as PagesState,
    reducers: {
        setPagesState: (state, action: PayloadAction<PagesState>) => {
            return action.payload;
        },
        addPage: (state, action: PayloadAction<Page>) => {
            action.payload.ordering = state.pages.length;
            state.pages.push({id: (Math.random() * 1000000 + 1000000), page: action.payload});
        },
        removePage: (state, action: PayloadAction<number>) => {
            const tail = state.pages.slice(action.payload + 1);
            state.pages = state.pages.slice(0, action.payload);
            state.pages.push(...tail);
            updateOrdering(state.pages);
        },
        updatePage: (state, action: PayloadAction<Page>) => {
            state.pages[action.payload.ordering].page = action.payload;
        },
        movePage: (state, action: PayloadAction<{ oldIndex: number, newIndex: number }>) => {
            const {oldIndex, newIndex} = action.payload;
            if (newIndex < 0 || newIndex >= state.pages.length) return;
            [state.pages[oldIndex], state.pages[newIndex]] =
                [state.pages[newIndex], state.pages[oldIndex]];
            updateOrdering(state.pages);
        },
        addInputToPage: (state, action: PayloadAction<{ nodeID: string, pageName: string }>) => {
            state.pages.forEach(({page}) => {
                page.inputIds = page.inputIds.filter(id => id !== action.payload.nodeID)
                if (page.title === action.payload.pageName) {
                    page.inputIds.push(action.payload.nodeID);
                }
            })
        },
        removeInputFromPage: (state, action: PayloadAction<{nodeID: string, pageName: string}>) =>{
            state.pages.forEach(({page})=>{
                page.inputIds = page.inputIds.filter(id => id !== action.payload.nodeID)
            });
        },
        moveInputOnPage: (state, action: PayloadAction<{ title: string, oldIndex: number, newIndex: number }>) => {
            const {oldIndex, newIndex} = action.payload;
            const page = state.pages.find(p=>p.page.title == action.payload.title)?.page;

            if (!page || newIndex < 0 || newIndex >= page.inputIds.length) return;

            [page.inputIds[newIndex], page.inputIds[oldIndex]] =
                [page.inputIds[oldIndex], page.inputIds[newIndex]];
        },
        setPageSelection: (state, action: PayloadAction<number>) => {
            state.selected = action.payload;
        }
    }
});

export const {
    addPage,
    removePage,
    updatePage,
    movePage,
    addInputToPage,
    moveInputOnPage,
    setPageSelection,
    setPagesState,
    removeInputFromPage
} = pageSlice.actions;
export const pagesReducer = pageSlice.reducer;
