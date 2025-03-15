import React from "react";
import styled from "styled-components";

const ConcludeModal = ({ isOpen, onClose, onConfirm, actionText }) => {
  if (!isOpen) return null;

  return (
    <StyledWrapper>
      <div className="card">
        <div className="card-content">
          <p className="card-heading">Confirm Action</p>
          <p className="card-description">
            Are you sure you want to {actionText}?
          </p>
        </div>
        <div className="card-button-wrapper">
          <button className="card-button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="card-button primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
        <button className="exit-button" onClick={onClose}>
          <svg height="20px" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
          </svg>
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .card {
    width: 320px;
    background: rgb(255, 255, 255);
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 25px;
    position: relative;
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  }
  .card-content {
    width: 100%;
    text-align: center;
  }
  .card-heading {
    font-size: 22px;
    font-weight: bold;
    color: #333;
  }
  .card-description {
    font-size: 16px;
    color: #666;
  }
  .card-button-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
  .card-button {
    width: 45%;
    height: 35px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 600;
  }
  .primary {
    background-color: #d9534f;
    color: white;
  }
  .primary:hover {
    background-color: #c9302c;
  }
  .secondary {
    background-color: #ddd;
  }
  .secondary:hover {
    background-color: #bbb;
  }
  .exit-button {
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background-color: transparent;
    cursor: pointer;
  }
  .exit-button svg {
    fill: rgb(175, 175, 175);
  }
  .exit-button:hover svg {
    fill: black;
  }
`;

export default ConcludeModal;
