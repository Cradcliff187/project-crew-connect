
import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Helper function to detect mobile devices based on user agent
const checkUserAgentForMobile = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || ''
  
  // Regular expressions for mobile devices
  const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i
  const tabletRegex = /android|ipad|playbook|silk/i
  
  // Check if touch is supported
  const hasTouchScreen = () => {
    if (typeof navigator === 'undefined') return false
    return 'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
  }
  
  // Device is considered mobile if it matches mobile regex or is a tablet with touch
  return mobileRegex.test(userAgent) || 
    (tabletRegex.test(userAgent) && hasTouchScreen())
}

export function useIsMobile() {
  // Use a ref to determine if component is mounted to avoid SSR issues
  const isMounted = React.useRef(false)
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    isMounted.current = true
    
    // Initial check: First check user agent, then screen size as fallback
    const checkMobile = () => {
      if (!isMounted.current) return
      
      // First try user agent detection
      const userAgentIsMobile = checkUserAgentForMobile()
      
      // Then check screen width as fallback/additional signal
      const screenWidthIsMobile = window.innerWidth < MOBILE_BREAKPOINT
      
      // Device is considered mobile if either condition is true
      setIsMobile(userAgentIsMobile || screenWidthIsMobile)
    }
    
    // Run check immediately
    checkMobile()
    
    // Set up event listeners for responsive design
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleResize = () => checkMobile()
    
    // Listen for screen size changes
    mql.addEventListener("change", handleResize)
    window.addEventListener("resize", handleResize)
    
    return () => {
      isMounted.current = false
      mql.removeEventListener("change", handleResize)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}

// Export an additional hook for more specific device capabilities
export function useDeviceCapabilities() {
  const isMobile = useIsMobile()
  const [capabilities, setCapabilities] = React.useState({
    hasCamera: false,
    hasTouch: false,
    hasMicrophone: false
  })
  
  React.useEffect(() => {
    const detectCapabilities = async () => {
      // Check for touch support
      const hasTouch = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        (navigator as any).msMaxTouchPoints > 0
      
      // Check for camera capability (permissions not requested yet)
      let hasCamera = false
      try {
        hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints().deviceId)
      } catch (e) {
        console.log("Camera detection error:", e)
      }
      
      // Check for microphone capability
      let hasMicrophone = false
      try {
        hasMicrophone = !!(navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints().deviceId)
      } catch (e) {
        console.log("Microphone detection error:", e)
      }
      
      setCapabilities({
        hasCamera,
        hasTouch,
        hasMicrophone
      })
    }
    
    detectCapabilities()
  }, [])
  
  return { isMobile, ...capabilities }
}
