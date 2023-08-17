import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import md5 from 'md5';

import { AiOutlineCheckCircle } from "react-icons/ai";
import { MdOutlineArrowBack } from "react-icons/md";

import CustomToast from '../components/CustomToast';
import { apiSetPayment, apiSaveMembership, apiGetUserInfo, apiUpdateUserInfo, getSession, setSession, updateSessionPlan } from '../utils/action';

const SubScriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { _id, plan_id } = getSession();

  const [tab, setTab] = useState('Monthly');
  const [price, setPrice] = useState(20);
  const [plan, setPlan] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function temp() {
      let param = new URLSearchParams(location.search).get('result');
      // console.log(param);
      if (param) {
        if (md5('success') == param) {
          let result = await apiGetUserInfo({ user_id: _id });
          if (result.success) {
            if (result.data.plan_id == 2) {
              updateSessionPlan(2);
              setPlan(2);
              setToastMessage('Subscription was purchased successfully!');
              await apiUpdateUserInfo({ user_id: _id, key: 'update_membership', value: {} });
            }
          }
        } else if (md5('failed') == param) {
          setToastMessage('Update failed');
          setPlan(1);
        }
      } else {
        setPlan(plan_id);
      }
    }
    temp()
  }, [plan_id])

  const handleMonthly = () => {
    setPrice(20);
    setTab("Monthly");
  }

  const handleAnnual = () => {
    setPrice(144);
    setTab("Annual");
  }

  const handleMembership = async (type) => {

    // console.log(type);
    if (type == 1) {
      const product = {
        user_id: _id,
        amount: price,
        plan_id: type,
        type: tab
      }

      const response = await apiSaveMembership(product);
      // console.log(response);
      if (response.success) {
        updateSessionPlan(type);
        setPlan(type);
        setToastMessage('Downgrade plan successfully!');
      } else {
        setToastMessage('Update Failed.');
      }
    } else if (type == 2) {

      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISH__KEY);
      const product = {
        user_id: _id,
        name: "Essay Premium membership.",
        amount: price,
        plan_id: type,
        type: tab
      }

      // console.log(product);
      const response = await apiSetPayment({ product: product });
      // console.log('make payment >>', response);

      if (response.success) {
        const result = stripe.redirectToCheckout({
          sessionId: response.data.id,
        });
        if (result.error) {
          setToastMessage(result.error);
          console.log(result.error);
        }
      } else {
        setToastMessage('Update Failed.');
      }
    }
  }

  return (
    <>
      <div
        className="container h-screen m-auto"
      >
        <div
          className="flex flex-col justify-center h-full gap-5"
        >
          <div
            className="cursor-pointer hover:bg-opacity-80 bg-gray-dark px-4 py-1 w-fit rounded flex flex-row items-center gap-2 absolute top-5 left-20"
            onClick={() => navigate('/')}
          >
            <MdOutlineArrowBack /> Back
          </div>
          <div></div>
          <div
            className="flex flex-row justify-center gap-10"
          >
            <div
              className={`text-lg cursor-pointer flex flex-row justify-start ${tab === 'Monthly' ? 'p-1 px-4 rounded bg-gray-dark' : 'text-[#00000060] bg-gray-light'} p-1 px-4 rounded`}
              onClick={handleMonthly}
            >
              Monthly
            </div>
            <div
              className={`text-lg cursor-pointer flex flex-row justify-start ${tab === 'Annual' ? 'p-1 px-4 rounded bg-gray-dark' : 'text-[#00000060] bg-gray-light'} p-1 px-4 rounded`}
              onClick={handleAnnual}
            >
              <div className="">Annual</div>
              <span className="text-xs text-green p-1">Save 40%</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row text-essayModalText gap-20 justify-center">
            <div>
              <div>Free</div>
              <div className="flex flex-row items-end gap-2">
                <div className="font-extrabold text-5xl text-[#000]">$0</div>
                <div>/{tab === "Monthly" ? 'month' : 'year'}</div>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>200 AI words per day</div></div>
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>AI Autocomplete</div></div>
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>Journal & web citations</div></div>
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>AI editing commands</div></div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
              </div>
              <button
                className={`w-full mt-7 ${plan == 1 ? 'bg-[#919191]' : 'bg-upgradeBtn hover:bg-upgradeBtn-hover'} rounded p-2 px-10 text-white text-lg cursor-pointer hover:bg-opacity-80`}
                disabled={plan == 1 ? true : false}
                onClick={() => handleMembership(1)}
              >
                {plan == 1 ? "Current Plan" : "Downgrade"}
              </button>
            </div>
            <div>
              <div>Unlimited</div>
              <div className="flex flex-row items-end gap-2">
                <div className="font-extrabold text-5xl text-[#000]">${price}</div>
                <div>/{tab === "Monthly" ? 'month' : 'year'}</div>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>Unlimited AI words</div></div>
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>AI Autocomplete</div></div>
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>Journal & web citations</div></div>
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>AI editing commands</div></div>
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>Priority support</div></div>
                <div className="flex flex-row gap-2 items-center"><AiOutlineCheckCircle className="text-[#202020] text-lg" /><div>Access to latest features</div></div>
              </div>
              <button
                className={`w-full mt-7 ${plan == 2 ? 'bg-[#919191]' : 'bg-upgradeBtn hover:bg-upgradeBtn-hover'} rounded p-2 px-10 text-white text-lg cursor-pointer hover:bg-opacity-80`}
                disabled={plan == 2 ? true : false}
                onClick={() => handleMembership(2)}
              >
                {plan == 2 ? "Current Plan" : "Upgrade Membership"}
              </button>
            </div>
          </div>
        </div>
        <CustomToast value={toastMessage} setToastMessage={setToastMessage} />
      </div>
    </>
  )
}

export default SubScriptionPage