import { useEffect, useState } from 'react'
import { CreditCard, Wallet, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import FeatureSlider from '@/components/subComp/SliderCard'
import { useNavigate } from 'react-router-dom'

export default function BillingAccount() {
  const [tokens, setTokens] = useState(0)
  const [tokensToBuy, setTokensToBuy] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState({ name: '', email: '', tokens: 0 })
  const navigate=useNavigate();

  const subscriptionPlans = [
    { name: 'Basic', tokens: 1000, price: 45, originalPrice: 50 },
    { name: 'Pro', tokens: 5000, price: 200, originalPrice: 250 },
    { name: 'Enterprise', tokens: 20000, price: 750, originalPrice: 1000 },
  ]

  useEffect(() => {
    const fetchUserBillingAccount = async () => {
      const token = localStorage.getItem("accessToken")
      const userId = localStorage.getItem("id")

      if (!userId || !token) {
        console.error("User ID or access token is missing!")
        return
      }

      try {
        const response = await fetch("http://localhost:8000/api/v1/billing/billingAccount", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        const data = await response.json()
        if (data.success) {
          setUserInfo({
            name: data.data.user.name,
            email: data.data.user.email,
            tokens: data.data.token,
          })
          setTokens(data.data.token) // Update the tokens state with fetched data
        } else {
          console.error("Error fetching billing account:", data.message)
        }
      } catch (err) {
        console.error("Network error:", err)
      }
    }

    fetchUserBillingAccount()
  }, []);


  function loadScript(src: string) {
    return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
  }

  const createOrder = async (amount:number) => {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("id");

    if (!userId || !token) {
      console.error("User ID or access token is missing!");
      return;
    }

    try {
        
      const response = await fetch("http://localhost:8000/api/v1/billing/createOrder", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, currency:"INR" }),
      });

      const data = await response.json();
     
      return data.data;

    } catch (e) {
        console.log("Failed to get OrderID");
    }
  };

  
  const createRazorpayPayment = async () => {
    const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js",
    );

    if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
    }

    let amount=0;
    let cost=0;

    if (selectedPlan) {
      const plan = subscriptionPlans.find(p => p.name === selectedPlan)
      if (plan) {
        amount=+plan.tokens;
        cost=plan.price;
      }
    } else if (tokensToBuy > 0) {
      amount=+tokensToBuy;
      cost=amount*0.05;
    }

    try {
        const orderData = await createOrder(cost);

        const options = {
            key_id:  import.meta.env.RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "LLM",
            description: "Test Transaction",
            image: "https://i.ibb.co/5Y3m33n/test.png",
            order_id: orderData.orderID,
            handler: async function (respons:any) {

              const token = localStorage.getItem("accessToken");
              const userId = localStorage.getItem("id");

                try {

                  console.log(respons);

                  if (!userId || !token) {
                    console.error("User ID or access token is missing!");
                    return;
                  }

                  const response = await fetch("http://localhost:8000/api/v1/billing/buytoken", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId,tokens:amount }),
                  });
            
                  const data = await response.json();
                  console.log("Dta:",data);
                  
                  navigate(`/payment/success`, { replace: true })

                } catch (error) {
                  console.log("Error",error);
                  

                    navigate(`/payment/failed`, { replace: true })
                }
            },
            theme: {
                color: "#3399cc",
            },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();

    } catch (errors) {
        console.error(`Razorpay Payment Failed: ${errors}`);
    }
  };

  

  const handlePlanSelect = (planName: string) => {
    const plan = subscriptionPlans.find(p => p.name === planName)
    if (plan) {
      setSelectedPlan(planName)
      setTokensToBuy(plan.tokens)
    }
  }

  const handleChangeSelection = () => {
    setSelectedPlan(null)
    setTokensToBuy(0)
  }

  const handlePurchase = () => {
    createRazorpayPayment();
    setSelectedPlan(null)
    setTokensToBuy(0)
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Billing Account</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your billing account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userInfo.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={userInfo.name} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokens">Available Tokens</Label>
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span className="text-2xl font-bold">{tokens}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedPlan ? 'Selected Plan' : 'Purchase Tokens'}</CardTitle>
            <CardDescription>{selectedPlan ? 'Review your selected plan' : 'Add tokens to your account'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPlan ? (
              <>
                <div className="space-y-2">
                  <Label>Selected Plan</Label>
                  <div className="text-2xl font-bold">{selectedPlan}</div>
                  <div className="text-sm text-muted-foreground">
                    {subscriptionPlans.find(p => p.name === selectedPlan)?.tokens} tokens
                  </div>
                </div>
                <Button variant="outline" onClick={handleChangeSelection} className="w-full">
                  Change Selection
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="tokenAmount">Number of Tokens</Label>
                <Input 
                  id="tokenAmount" 
                  type="number" 
                  placeholder="Enter amount" 
                  value={tokensToBuy}
                  onChange={(e) => setTokensToBuy(Number(e.target.value))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Cost</Label>
              <div className="text-2xl font-bold">
              ₹{selectedPlan 
                  ? subscriptionPlans.find(p => p.name === selectedPlan)?.price.toFixed(2) 
                  : (tokensToBuy * 0.05).toFixed(2)}
              </div>
              {!selectedPlan && <p className="text-sm text-muted-foreground">0.5 ₹ = 10 tokens</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePurchase} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" /> 
              {selectedPlan ? `Purchase ${selectedPlan} Plan` : 'Purchase Tokens'}
            </Button>
          </CardFooter>
        </Card>

        <FeatureSlider/>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Choose a plan and save on tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup onValueChange={handlePlanSelect} value={selectedPlan || ''} className="grid gap-4 md:grid-cols-3">
              {subscriptionPlans.map((plan) => (
                <div key={plan.name}>
                  <RadioGroupItem value={plan.name} id={plan.name} className="peer sr-only" />
                  <Label
                    htmlFor={plan.name}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                  >
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <div className="text-center my-2">
                      <div className="text-3xl font-bold">{plan.tokens} tokens</div>
                      <div className="text-sm text-muted-foreground">
                        <span className="line-through">₹{plan.originalPrice}</span>{' '}
                        <span className="text-green-500 font-semibold">₹{plan.price}</span>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Star className="h-4 w-4 mr-1 text-yellow-400" />
              New subscriber features coming soon!
            </div>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>Priority support</li>
              <li>Early access to new AI models</li>
              <li>Exclusive webinars and tutorials</li>
            </ul>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
