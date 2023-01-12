import React, { useReducer, useState } from "react";
import "./index.css";
import { BiHide, BiShow, BiEditAlt } from "react-icons/bi";
import { BsSortAlphaDown, BsSortAlphaDownAlt } from "react-icons/bs";
import { MdOutlinePersonAdd } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import { ExclamationCircleFilled } from "@ant-design/icons";
import {
  Input,
  Button,
  Modal,
  Space,
  notification,
  Drawer,
  message,
} from "antd";
import { copyUsersData, data, usersData } from "../utils";

let ACTIONS = {
  ACTION_ADD: "action_add",
  ADD_INPUT_VALUE: "add_input_value",
  ACTION_DELETE: "action_delete",
  ACTION_EDIT: "action_edit",
  SAVE: "save",
  EDIT_INPUT_VALUE: "edit_input_value",
  DELETE: "delete",
  SEARCH: "search",
  OPEN_ADD: "open_add",
  CLOSE_ADD: "close_add",
  ACTION_SORT_BY_NAME: "action_sort_by_name",
  ACTION_SORT_BY_SURNAME: "action_sort_by_surname",
  ACTION_SORT_BY_EMAIL: "action_sort_by_email",
};
let reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.DELETE:
      return {
        ...state,
        data: state.data.filter((value) => value.id !== action.payload.id),
      };
    case ACTIONS.ACTION_ADD:
      return {
        ...state,
        data: [...state.data, { ...action.payload, id: new Date().getTime() }],
        dataCollector: {
          name: "",
          surname: "",
          email: "",
          password: "",
        },
        isOpenAdd: false,
      };
    case ACTIONS.ADD_INPUT_VALUE:
      return {
        ...state,
        dataCollector: {
          ...state.dataCollector,
          [action.payload.name]: action.payload.value,
        },
      };
    case ACTIONS.ACTION_DELETE:
      return {
        data: state.data.map((value, index) => {
          return { ...value, id: index + 1 };
        }),
      };
    case ACTIONS.ACTION_EDIT:
      return { ...state, isShow: true, selectedData: action.payload };
    case ACTIONS.EDIT_INPUT_VALUE:
      return {
        ...state,
        selectedData: {
          ...state.selectedData,
          [action.payload.name]: action.payload.value,
        },
      };
    case ACTIONS.SAVE:
      console.log(state.selectedData);
      return {
        ...state,
        data: state.data.map((value) =>
          state.selectedData.id === value.id ? state.selectedData : value
        ),
      };
    case "show":
      return { ...state, showOrHide: true, selectedData: action.payload };
    case "hide":
      return { ...state, showOrHide: false, selectedData: action.payload };
    case ACTIONS.SEARCH:
      let copied = state.copyData;
      return {
        ...state,
        data: copied.filter(
          (value) =>
            value.name
              .toLowerCase()
              .includes(action.payload.value.toLowerCase()) ||
            value.surname
              .toLowerCase()
              .includes(action.payload.value.toLowerCase()) ||
            value.email
              .toLowerCase()
              .includes(action.payload.value.toLowerCase()) ||
            value.password
              .toLowerCase()
              .includes(action.payload.value.toLowerCase())
        ),
      };
    case ACTIONS.OPEN_ADD:
      return { ...state, isOpenAdd: true };
    case ACTIONS.CLOSE_ADD:
      return { ...state, isOpenAdd: false };
    case ACTIONS.ACTION_SORT_BY_NAME:
      return {
        ...state,
        isSortName: !state.isSortName,

        data: state.isSortName
          ? state.data.sort((a, b) => (a.name < b.name ? 1 : -1))
          : state.data.sort((a, b) => (a.name > b.name ? 1 : -1)),
      };
    case ACTIONS.ACTION_SORT_BY_SURNAME:
      return {
        ...state,
        isSortSurname: !state.isSortSurname,
        data: state.isSortSurname
          ? state.data.sort((a, b) => (a.surname < b.surname ? 1 : -1))
          : state.data.sort((a, b) => (a.surname > b.surname ? 1 : -1)),
      };
    case ACTIONS.ACTION_SORT_BY_EMAIL:
      return {
        ...state,
        isSortEmail: !state.isSortEmail,
        data: state.isSortEmail
          ? state.data.sort((a, b) => (a.email < b.email ? 1 : -1))
          : state.data.sort((a, b) => (a.email > b.email ? 1 : -1)),
      };
    default:
      return state;
  }
};
const Reducer = () => {
  const { confirm } = Modal;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const showEditModal = () => {
    setIsEditModal(true);
  };
  let handleKey = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      handleOkEdit();
    }
  };
  let handleEnter = (e) => {
    console.log(e);
    if (e.key === "Enter" || e.type === "click") {
      handleOk();
    }
  };
  const handleOk = () => {
    if (
      state.dataCollector.name.length &&
      state.dataCollector.surname.length &&
      state.dataCollector.email.length &&
      state.dataCollector.password.length > 0
    ) {
      dispatch({
        type: ACTIONS.ACTION_ADD,
        payload: {
          name: state.dataCollector.name,
          surname: state.dataCollector.surname,
          email: state.dataCollector.email,
          password: state.dataCollector.password,
        },
      });
      success();
    } else {
      openNotificationWithIcon("warning");
    }
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleOkEdit = () => {
    setIsEditModal(false);
    dispatch({ type: ACTIONS.SAVE });
  };
  const handleCancelEdit = () => {
    setIsEditModal(false);
  };
  const [api, contextHolder1] = notification.useNotification();
  const openNotificationWithIcon = (type) => {
    api[type]({
      message: "Form is not filled",
      duration: 3,
      description: "Please fill the fields",
    });
  };

  const showConfirm = (id) => {
    confirm({
      title: <h2 className='sure' >Are you sure delete this user?</h2>,
      icon: <ExclamationCircleFilled />,
      onOk() {
        dispatch({
          type: ACTIONS.DELETE,
          payload: { id: id },
        });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };
  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({
      type: "success",
      content: "User successfully added",
    });
  };
  let [state, dispatch] = useReducer(reducer, {
    data: usersData,
    copyData: copyUsersData,
    count: 0,
    isShow: false,
    isEditOrSave: false,
    showOrHide: false,
    isOpenAdd: false,
    isSortSurname: false,
    isSortName: false,
    isSortEmail: false,
    dataCollector: {
      name: "",
      surname: "",
      email: "",
      password: "",
    },
    selectedData: {},
  });

  return (
    <div>
      <Modal
        width={700}
        title="Add user"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="addFlex">
          <div>
            {" "}
            <div className="addFlex">
              <label className="lab">Name:</label>
              <Input
                value={state.dataCollector.name}
                style={{ padding: "20px" }}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.ADD_INPUT_VALUE,
                    payload: { name: "name", value: e.target.value },
                  })
                }
                placeholder="Enter name"
              />
            </div>
            <div className="addFlex">
              <label className="lab">Email:</label>
              <Input
                value={state.dataCollector.email}
                style={{ padding: "20px" }}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.ADD_INPUT_VALUE,
                    payload: { name: "email", value: e.target.value },
                  })
                }
                placeholder="Enter email"
              />
            </div>
          </div>
          <div>
            {" "}
            <div className="addFlex">
              <label className="lab">Surname:</label>
              <Input
                value={state.dataCollector.surname}
                style={{ padding: "20px" }}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.ADD_INPUT_VALUE,
                    payload: { name: "surname", value: e.target.value },
                  })
                }
                placeholder="Enter surname"
              />
            </div>
            <div className="addFlex">
              <label className="lab">Password:</label>
              <Input
                value={state.dataCollector.password}
                onKeyDown={handleEnter}
                style={{ padding: "20px" }}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.ADD_INPUT_VALUE,
                    payload: { name: "password", value: e.target.value },
                  })
                }
                placeholder="Enter password"
              />
            </div>
          </div>
        </div>
      </Modal>
      {/* edit modal  */}
      <Modal
        title="Edit user"
        open={isEditModal}
        onOk={handleOkEdit}
        onCancel={handleCancelEdit}
        width={700}
      >
        <div className="editInputs">
          <label className="editLabel">Name:</label>
          <Input
            onKeyDown={handleKey}
            style={{ padding: "20px", fontSize: "13px" }}
            className="editer-input"
            value={state.selectedData.name}
            onChange={(e) =>
              dispatch({
                type: ACTIONS.EDIT_INPUT_VALUE,
                payload: { name: "name", value: e.target.value },
              })
            }
          />
          <label className="editLabel">Surname:</label>
          <Input
            onKeyDown={handleKey}
            style={{ padding: "20px", fontSize: "13px" }}
            size="large"
            className="editer-input"
            value={state.selectedData.surname}
            onChange={(e) =>
              dispatch({
                type: ACTIONS.EDIT_INPUT_VALUE,
                payload: { name: "surname", value: e.target.value },
              })
            }
          />
        </div>
        <div className="editInputs">
          <label className="editLabel">Email:</label>
          <Input
            onKeyDown={handleKey}
            style={{ padding: "20px", fontSize: "13px" }}
            className="editer-input"
            value={state.selectedData.email}
            onChange={(e) =>
              dispatch({
                type: ACTIONS.EDIT_INPUT_VALUE,
                payload: { name: "email", value: e.target.value },
              })
            }
          />
          <label className="editLabel">Password:</label>
          <Input
            onKeyDown={handleKey}
            style={{ padding: "20px", fontSize: "13px" }}
            className="editer-input"
            value={state.selectedData.password}
            onChange={(e) =>
              dispatch({
                type: ACTIONS.EDIT_INPUT_VALUE,
                payload: { name: "password", value: e.target.value },
              })
            }
          />
        </div>
      </Modal>
      {contextHolder1}
      {contextHolder}
      <div className="contain">
        <div className="global">
          <Input
            className="search"
            placeholder="Search user"
            allowClear
            autoFocus
            size="large"
            onChange={(e) =>
              dispatch({
                type: ACTIONS.SEARCH,
                payload: { value: e.target.value },
              })
            }
          />
          <Button
            //dispatch({ type: ACTIONS.OPEN_ADD })
            onClick={() => showModal()}
            className="open_add"
            type="primary"
            shape="circle"
          >
            <MdOutlinePersonAdd size={"25"} />
          </Button>
        </div>

        <div className="wrapper-table">
          <table className="caption-top">
            <caption>Number of users {state.data.length}</caption>
            <thead>
              <tr className="tr">
                <th>
                  <div className="sortItems">ID</div>
                </th>
                <th>
                  <div className="sortItems">
                    Name
                    {state.isSortName ? (
                      <BsSortAlphaDownAlt
                        className="sortIcon"
                        onClick={() =>
                          dispatch({ type: ACTIONS.ACTION_SORT_BY_NAME })
                        }
                        cursor={"pointer"}
                        size={"18px"}
                      />
                    ) : (
                      <BsSortAlphaDown
                        className="sortIcon"
                        onClick={() =>
                          dispatch({ type: ACTIONS.ACTION_SORT_BY_NAME })
                        }
                        cursor={"pointer"}
                        size={"18px"}
                      />
                    )}
                  </div>
                </th>
                <th>
                  <div className="sortItems">
                    {" "}
                    Surname
                    {state.isSortSurname ? (
                      <BsSortAlphaDownAlt
                        className="sortIcon"
                        onClick={() =>
                          dispatch({ type: ACTIONS.ACTION_SORT_BY_SURNAME })
                        }
                        cursor={"pointer"}
                        size={"18px"}
                      />
                    ) : (
                      <BsSortAlphaDown
                        className="sortIcon"
                        onClick={() =>
                          dispatch({ type: ACTIONS.ACTION_SORT_BY_SURNAME })
                        }
                        cursor={"pointer"}
                        size={"18px"}
                      />
                    )}
                  </div>
                </th>
                <th>
                  <div className="sortItems">
                    {" "}
                    Email
                    {state.isSortEmail ? (
                      <BsSortAlphaDownAlt
                        className="sortIcon"
                        onClick={() =>
                          dispatch({ type: ACTIONS.ACTION_SORT_BY_EMAIL })
                        }
                        cursor={"pointer"}
                        size={"18px"}
                      />
                    ) : (
                      <BsSortAlphaDown
                        className="sortIcon"
                        onClick={() =>
                          dispatch({ type: ACTIONS.ACTION_SORT_BY_EMAIL })
                        }
                        cursor={"pointer"}
                        size={"18px"}
                      />
                    )}
                  </div>
                </th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.data.map((value, index) => (
                <tr border="45px" className="bottom" key={value.id}>
                  <td>{index + 1}</td>
                  <td>{value.name}</td>

                  <td>{value.surname}</td>
                  <td>{value.email}</td>
                  <td>
                    <div className="pass">
                      {state.showOrHide && state.selectedData.id === value.id
                        ? value.password
                        : "•".repeat(value.password.length)}
                      {state.showOrHide &&
                      state.selectedData.id === value.id ? (
                        <BiHide
                          className="bi"
                          size={"22"}
                          onClick={() =>
                            dispatch({
                              type: "hide",
                              payload: {
                                name: value.name,
                                surname: value.surname,
                                email: value.email,
                                password: value.password,
                                id: value.id,
                              },
                            })
                          }
                        />
                      ) : (
                        <BiShow
                          className="bi"
                          size={"22"}
                          onClick={() =>
                            dispatch({
                              type: "show",
                              payload: {
                                name: value.name,
                                surname: value.surname,
                                email: value.email,
                                password: value.password,
                                id: value.id,
                              },
                            })
                          }
                        />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <BiEditAlt
                        onClick={() => {
                          showEditModal();
                          dispatch({
                            type: ACTIONS.ACTION_EDIT,
                            payload: {
                              name: value.name,
                              surname: value.surname,
                              email: value.email,
                              password: value.password,
                              id: value.id,
                            },
                          });
                        }}
                        className="bi"
                        size={"25"}
                      />

                      <AiTwotoneDelete
                        className="bi"
                        size={"25"}
                        color={"red"}
                        onClick={() => {
                          showConfirm(value.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reducer;
